import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import CodeEditor from '../components/CodeEditor';
import { runPythonTestCase } from '../utils/runPython';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

type Screen =
  | 'lobby'
  | 'waiting'
  | 'countdown'
  | 'battle'
  | 'result';

interface Problem {
  title: string;
  slug: string;
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  starterCode: string;
  functionName: string;
  testCases: { input: string; expectedOutput: string; isHidden: boolean }[];
}

interface Room {
  code: string;
  hostId: string;
  hostUsername: string;
  guestId: string | null;
  guestUsername: string | null;
  language: string;
  timerMinutes: number;
  problem: Problem;
}

interface BattleResult {
  winner: string | null;
  winnerUsername: string | null;
  reason: string;
  submissions: Record<string, { passedTests: number; totalTests: number; allPassed: boolean }>;
}

interface SubmitResult {
  passedTests: number;
  totalTests: number;
  allPassed: boolean;
}

const LANGUAGE_LABELS: Record<string, string> = {
  python: 'Python',
};

const MONACO_LANG: Record<string, string> = {
  python: 'python',
};

export default function PlayWithFriend() {
  const socketRef = useRef<Socket | null>(null);

  const [screen, setScreen] = useState<Screen>('lobby');
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [timerMinutes, setTimerMinutes] = useState(10);
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [room, setRoom] = useState<Room | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [countdownCount, setCountdownCount] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [code, setCode] = useState('');
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);
  const [runResult, setRunResult] = useState<SubmitResult | null>(null);
  const [runError, setRunError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [opponentStatus, setOpponentStatus] = useState<string>('');
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pyodideLoading, setPyodideLoading] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id;

  useEffect(() => {
    const token = localStorage.getItem('token');
    const socket = io(API_BASE, { auth: { token } });
    socketRef.current = socket;

    socket.on('guest_joined', ({ guestUsername, room: updatedRoom }) => {
      setRoom(updatedRoom);
      setOpponentStatus(`${guestUsername} joined the room!`);
    });

    socket.on('countdown', ({ count }) => {
      setScreen('countdown');
      setCountdownCount(count);
    });

    socket.on('battle_start', ({ timerMinutes: mins, startedAt }) => {
      setScreen('battle');
      setCountdownCount(null);
      setCode('');
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const totalSeconds = mins * 60 - elapsed;
      setTimeLeft(totalSeconds);

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

    socket.on('opponent_submitted', ({ username, passedTests, totalTests }) => {
      setOpponentStatus(`${username} submitted: ${passedTests}/${totalTests} tests passed`);
    });

    socket.on('battle_end', (result: BattleResult) => {
      setBattleResult(result);
      if (timerRef.current) clearInterval(timerRef.current);
      setScreen('result');
    });

    socket.on('opponent_disconnected', ({ username }) => {
      setOpponentStatus(`${username} disconnected`);
      setError(`${username} left the battle.`);
    });

    socket.on('connect_error', (err) => {
      setError(`Connection error: ${err.message}`);
    });

    return () => {
      socket.disconnect();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleCreateRoom = () => {
    if (!socketRef.current) return;
    setLoading(true);
    setError('');
    socketRef.current.emit(
      'create_room',
      { language: 'python', timerMinutes },
      (res: { error?: string; room?: Room }) => {
        setLoading(false);
        if (res.error) return setError(res.error);
        setRoom(res.room!);
        setIsHost(true);
        setScreen('waiting');
      }
    );
  };

  const handleJoinRoom = () => {
    if (!socketRef.current || !joinCode.trim()) return;
    setLoading(true);
    setError('');
    socketRef.current.emit(
      'join_room',
      joinCode.trim().toUpperCase(),
      (res: { error?: string; room?: Room }) => {
        setLoading(false);
        if (res.error) return setError(res.error);
        setRoom(res.room!);
        setIsHost(false);
        setScreen('waiting');
      }
    );
  };

  const handleStartBattle = () => {
    if (!socketRef.current) return;
    socketRef.current.emit('start_battle', (res: { error?: string }) => {
      if (res?.error) setError(res.error);
    });
  };

  const handleSubmit = async () => {
    if (!socketRef.current || submitting || !room) return;
    setSubmitting(true);
    setSubmitResult(null);
    setSubmitError('');
    setError('');

    try {
      // Check if Pyodide needs to be loaded
      const isFirstLoad = !(window as any).pyodide;
      if (isFirstLoad) {
        setPyodideLoading(true);
      }

      let passedTests = 0;
      let totalTests = 0;
      let lastError = '';

      // Run ALL test cases (visible + hidden)
      totalTests = room.problem.testCases?.length || 0;

      for (const testCase of room.problem.testCases || []) {
        const { output, error: pyError } = await runPythonTestCase(
          code,
          room.problem.functionName || '',
          testCase.input
        );

        if (pyError) {
          // Count this test as failed, store error, and continue
          lastError = pyError;
          continue;
        }

        const parsedOutput = JSON.parse(output);
        const parsedExpected = JSON.parse(testCase.expectedOutput);

        if (JSON.stringify(parsedOutput) === JSON.stringify(parsedExpected)) {
          passedTests++;
        }
      }

      const allPassed = passedTests === totalTests;
      setSubmitResult({ totalTests, passedTests, allPassed });
      setSubmitError(lastError);
      setRunResult(null);

      // Emit the result via socket (keep existing socket pattern)
      socketRef.current.emit(
        'battle_submit',
        { passedTests, totalTests, allPassed },
        (res: { error?: string }) => {
          setSubmitting(false);
          if (res.error) setError(res.error);
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSubmitting(false);
    } finally {
      setPyodideLoading(false);
    }
  };

  const handleRun = async () => {
    if (!room || submitting) return;
    setSubmitting(true);
    setRunResult(null);
    setRunError('');
    setError('');

    try {
      // Check if Pyodide needs to be loaded
      const isFirstLoad = !(window as any).pyodide;
      if (isFirstLoad) {
        setPyodideLoading(true);
      }

      let passedTests = 0;
      let totalTests = 0;
      let lastError = '';

      // Run ALL test cases
      totalTests = room.problem.testCases?.length || 0;

      for (const testCase of room.problem.testCases || []) {
        const { output, error: pyError } = await runPythonTestCase(
          code,
          room.problem.functionName || '',
          testCase.input
        );

        if (pyError) {
          // Count this test as failed, store error, and continue
          lastError = pyError;
          continue;
        }

        const parsedOutput = JSON.parse(output);
        const parsedExpected = JSON.parse(testCase.expectedOutput);

        if (JSON.stringify(parsedOutput) === JSON.stringify(parsedExpected)) {
          passedTests++;
        }
      }

      const allPassed = passedTests === totalTests;
      setRunResult({ totalTests, passedTests, allPassed });
      setRunError(lastError);
      setSubmitResult(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
      setPyodideLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ─── SCREENS ────────────────────────────────────────────────────────────────

  if (screen === 'lobby') {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-16 text-slate-100">
        <div className="mx-auto max-w-lg">
          <p className="text-center text-sm font-medium uppercase tracking-wide text-indigo-400">
            CodeBattle Arena
          </p>
          <h1 className="mt-2 text-center text-4xl font-bold text-slate-50">
            Challenge a Friend
          </h1>
          <p className="mt-3 text-center text-slate-400">
            Challenge a friend to a real-time coding battle
          </p>

          {/* Mode toggle */}
          <div className="mt-8 flex rounded-xl border border-slate-800 bg-slate-900 p-1">
            {(['create', 'join'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                  mode === m
                    ? 'bg-indigo-500 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m === 'create' ? 'Create Room' : 'Join Room'}
              </button>
            ))}
          </div>

          {mode === 'create' ? (
            <div className="mt-6 space-y-5 rounded-xl border border-slate-800 bg-slate-900 p-6">
              {/* Timer */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-400">
                  Timer: {timerMinutes} minutes
                </label>
                <input
                  type="range"
                  min={5}
                  max={60}
                  step={5}
                  value={timerMinutes}
                  onChange={(e) => setTimerMinutes(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
                <div className="mt-1 flex justify-between text-xs text-slate-500">
                  <span>5 min</span>
                  <span>60 min</span>
                </div>
              </div>

              {error && (
                <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
                  {error}
                </p>
              )}

              <button
                onClick={handleCreateRoom}
                disabled={loading}
                className="w-full rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-400 disabled:opacity-50"
              >
                {loading ? 'Creating room...' : 'Create Room'}
              </button>
            </div>
          ) : (
            <div className="mt-6 space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-400">
                  Room Code
                </label>
                <input
                  type="text"
                  placeholder="Enter 8-character code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={8}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-center font-mono text-lg tracking-widest text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>

              {error && (
                <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
                  {error}
                </p>
              )}

              <button
                onClick={handleJoinRoom}
                disabled={loading || joinCode.length !== 8}
                className="w-full rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-400 disabled:opacity-50"
              >
                {loading ? 'Joining...' : 'Join Room'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (screen === 'waiting') {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-16 text-slate-100">
        <div className="mx-auto max-w-lg text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-indigo-400">
            CodeBattle Arena
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-50">Battle Lobby</h1>

          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-8">
            <p className="text-sm text-slate-400">Room Code</p>
            <p className="mt-2 font-mono text-4xl font-bold tracking-widest text-indigo-300">
              {room?.code}
            </p>
            <p className="mt-3 text-xs text-slate-500">Share this code with your friend</p>

            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3">
                <p className="text-slate-400">Language</p>
                <p className="font-semibold text-slate-100">
                  {LANGUAGE_LABELS[room?.language || ''] || room?.language}
                </p>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3">
                <p className="text-slate-400">Timer</p>
                <p className="font-semibold text-slate-100">{room?.timerMinutes} minutes</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="text-sm text-slate-200">{room?.hostUsername} (Host)</span>
              </div>
              <div className={`flex items-center gap-3 rounded-lg border p-3 ${
                room?.guestUsername
                  ? 'border-emerald-500/20 bg-emerald-500/5'
                  : 'border-slate-700 bg-slate-800/30'
              }`}>
                <div className={`h-2.5 w-2.5 rounded-full ${
                  room?.guestUsername ? 'bg-emerald-400' : 'animate-pulse bg-slate-600'
                }`} />
                <span className="text-sm text-slate-400">
                  {room?.guestUsername || 'Waiting for opponent...'}
                </span>
              </div>
            </div>

            {opponentStatus && (
              <p className="mt-4 text-sm text-indigo-300">{opponentStatus}</p>
            )}

            {error && (
              <p className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
                {error}
              </p>
            )}

            {isHost && room?.guestUsername && (
              <button
                onClick={handleStartBattle}
                className="mt-6 w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400"
              >
                Start Battle!
              </button>
            )}

            {!isHost && (
              <p className="mt-6 text-sm text-slate-400">
                Waiting for host to start the battle...
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'countdown') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-indigo-400">
            Get Ready
          </p>
          <div className="mt-4 text-9xl font-bold text-slate-50 tabular-nums">
            {countdownCount}
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'battle' && room) {
    const timerColor =
      timeLeft > 60 ? 'text-emerald-300' : timeLeft > 30 ? 'text-amber-300' : 'text-rose-300';

    return (
      <div className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100">
        <div className="mx-auto max-w-4xl">

          {/* Battle header */}
          <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-5 py-3">
            <div className="text-sm text-slate-400">
              <span className="font-semibold text-slate-200">{room.hostUsername}</span>
              <span className="mx-2 text-slate-600">vs</span>
              <span className="font-semibold text-slate-200">{room.guestUsername}</span>
            </div>
            <div className={`font-mono text-2xl font-bold tabular-nums ${timerColor}`}>
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-slate-400">
              {LANGUAGE_LABELS[room.language] || room.language}
            </div>
          </div>

          {opponentStatus && (
            <div className="mb-4 rounded-lg border border-indigo-500/20 bg-indigo-500/5 px-4 py-2 text-sm text-indigo-300">
              {opponentStatus}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Problem panel */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-bold text-slate-100">{room.problem.title}</h2>
              </div>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-300">
                {room.problem.description}
              </p>
              {room.problem.examples.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Examples
                  </p>
                  {room.problem.examples.slice(0, 2).map((ex, i) => (
                    <div key={i} className="rounded-lg bg-slate-950 p-3 font-mono text-xs">
                      <div><span className="text-slate-500">Input: </span><span className="text-slate-300">{ex.input}</span></div>
                      <div><span className="text-slate-500">Output: </span><span className="text-slate-300">{ex.output}</span></div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Editor panel */}
            <div className="flex flex-col gap-3">
              <div className="overflow-hidden rounded-xl border border-slate-700">
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  language={MONACO_LANG[room.language] || 'javascript'}
                  height="420px"
                />
              </div>

              {submitResult && (
                <div className={`rounded-xl border p-4 ${
                  submitResult.allPassed && !submitError
                    ? 'border-emerald-500/30 bg-emerald-500/10'
                    : 'border-rose-500/30 bg-rose-500/10'
                }`}>
                  <p className={`font-semibold ${submitResult.allPassed && !submitError ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {submitResult.allPassed && !submitError ? '✓ All tests passed!' : '✗ Some tests failed'}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Passed {submitResult.passedTests} / {submitResult.totalTests} test cases
                  </p>
                  {submitError && (
                    <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3">
                      <p className="text-xs font-semibold text-rose-300">Error:</p>
                      <p className="mt-1 text-xs text-rose-200 font-mono whitespace-pre-wrap">{submitError}</p>
                    </div>
                  )}
                </div>
              )}

              {runResult && (
                <div className={`rounded-xl border p-4 ${
                  runResult.allPassed && !runError
                    ? 'border-emerald-500/30 bg-emerald-500/10'
                    : 'border-rose-500/30 bg-rose-500/10'
                }`}>
                  <p className={`font-semibold ${runResult.allPassed && !runError ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {runResult.allPassed && !runError ? '✓ All tests passed!' : '✗ Some tests failed'}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Passed {runResult.passedTests} / {runResult.totalTests} test cases
                  </p>
                  {runError && (
                    <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3">
                      <p className="text-xs font-semibold text-rose-300">Error:</p>
                      <p className="mt-1 text-xs text-rose-200 font-mono whitespace-pre-wrap">{runError}</p>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
                  {error}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleRun}
                  disabled={submitting || pyodideLoading}
                  className="flex-1 rounded-xl bg-slate-700 py-3 text-sm font-semibold text-white shadow-lg hover:bg-slate-600 disabled:opacity-50"
                >
                  {pyodideLoading ? 'Loading Python runtime...' : submitting ? 'Running...' : 'Run Tests'}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || pyodideLoading || !!submitResult?.allPassed}
                  className="flex-1 rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-400 disabled:opacity-50"
                >
                  {pyodideLoading ? 'Loading Python runtime...' : submitting ? 'Submitting...' : submitResult?.allPassed ? 'Submitted ✓' : 'Submit Solution'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'result') {
    const myId = userId;
    const iWon = battleResult?.winner === myId;
    const isDraw = !battleResult?.winner;

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-md text-center">
          <div className={`rounded-2xl border p-8 ${
            isDraw
              ? 'border-slate-700 bg-slate-900'
              : iWon
              ? 'border-emerald-500/30 bg-emerald-500/5'
              : 'border-rose-500/30 bg-rose-500/5'
          }`}>
            <div className="text-5xl">
              {isDraw ? '🤝' : iWon ? '🏆' : '😔'}
            </div>
            <h1 className={`mt-4 text-3xl font-bold ${
              isDraw ? 'text-slate-200' : iWon ? 'text-emerald-300' : 'text-rose-300'
            }`}>
              {isDraw ? 'Draw!' : iWon ? 'You Won!' : 'You Lost'}
            </h1>
            {battleResult?.winnerUsername && !isDraw && (
              <p className="mt-2 text-slate-400">
                {iWon ? 'Congratulations!' : `${battleResult.winnerUsername} won`}
              </p>
            )}
            <p className="mt-1 text-sm text-slate-500">{battleResult?.reason}</p>

            {/* Submission breakdown */}
            {battleResult?.submissions && room && (
              <div className="mt-6 space-y-2 text-left">
                {[
                  { id: room.hostId, username: room.hostUsername },
                  { id: room.guestId, username: room.guestUsername },
                ].map((player) => {
                  const sub = battleResult.submissions[player.id || ''];
                  return (
                    <div key={player.id} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 px-4 py-3">
                      <span className="text-sm font-medium text-slate-200">{player.username}</span>
                      <span className="text-sm text-slate-400">
                        {sub ? `${sub.passedTests}/${sub.totalTests} tests` : 'No submission'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => {
                setScreen('lobby');
                setRoom(null);
                setBattleResult(null);
                setSubmitResult(null);
                setOpponentStatus('');
                setError('');
                setCode('');
              }}
              className="mt-6 w-full rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white hover:bg-indigo-400"
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
