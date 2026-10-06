import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Trophy, Handshake, X } from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import { runPythonTestCase } from '../utils/runPython';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

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
      const isFirstLoad = !(window as { pyodide?: unknown }).pyodide;
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
      const isFirstLoad = !(window as { pyodide?: unknown }).pyodide;
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
      <div className="min-h-screen bg-[#0a0a0a] px-4 py-10 md:px-8">
        <div className="mx-auto max-w-lg">
          <div className="mb-8">
            <p className="text-sm font-medium uppercase tracking-wider text-[#f59e0b] font-mono">CodeBattle Arena</p>
            <h1 className="mt-2 text-[clamp(2rem,6vw,3rem)] font-semibold text-[#e5e5e5] font-mono">Challenge a Friend</h1>
          </div>

          <Card className="mb-6">
            <p className="text-sm text-[#a1a1aa] leading-relaxed">
              Challenge a friend to a real-time coding battle. Create a room or join with a code.
            </p>
          </Card>

          {/* Mode toggle */}
          <div className="mb-6 flex border border-[#6b7280] rounded-[var(--radius-lg)]">
            {(['create', 'join'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  mode === m
                    ? 'bg-[#121212] text-[#e5e5e5] border-r border-[#6b7280]'
                    : 'text-[#a1a1aa] hover:text-[#e5e5e5]'
                }`}
              >
                {m === 'create' ? 'Create Room' : 'Join Room'}
              </button>
            ))}
          </div>

          {mode === 'create' ? (
            <Card>
              <div className="mb-6">
                <label className="mb-2 block text-sm text-[#a1a1aa] font-mono">
                  Timer: {timerMinutes} minutes
                </label>
                <input
                  type="range"
                  min={5}
                  max={60}
                  step={5}
                  value={timerMinutes}
                  onChange={(e) => setTimerMinutes(Number(e.target.value))}
                  className="w-full accent-[#f59e0b]"
                />
                <div className="mt-1 flex justify-between text-xs text-[#6b7280]">
                  <span>5 min</span>
                  <span>60 min</span>
                </div>
              </div>

              {error && (
                <div className="mb-6 bg-[#f43f5e]/10 border border-[#f43f5e]/30 p-4 text-sm text-[#f43f5e] rounded-[var(--radius-lg)]" role="alert">
                  {error}
                </div>
              )}

              <Button
                onClick={handleCreateRoom}
                disabled={loading}
                loading={loading}
                className="w-full"
              >
                {loading ? 'Creating room...' : 'Create Room'}
              </Button>
            </Card>
          ) : (
            <Card>
              <div className="mb-6">
                <Input
                  label="Room Code"
                  placeholder="Enter 8-character code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={8}
                  className="font-mono text-center tracking-widest"
                />
              </div>

              {error && (
                <div className="mb-6 bg-[#f43f5e]/10 border border-[#f43f5e]/30 p-4 text-sm text-[#f43f5e] rounded-[var(--radius-lg)]" role="alert">
                  {error}
                </div>
              )}

              <Button
                onClick={handleJoinRoom}
                disabled={loading || joinCode.length !== 8}
                loading={loading}
                className="w-full"
              >
                {loading ? 'Joining...' : 'Join Room'}
              </Button>
            </Card>
          )}
        </div>
      </div>
    );
  }

  if (screen === 'waiting') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] px-4 py-10 md:px-8">
        <div className="mx-auto max-w-lg">
          <div className="mb-8">
            <p className="text-sm font-medium uppercase tracking-wider text-[#f59e0b] font-mono">CodeBattle Arena</p>
            <h1 className="mt-2 text-[clamp(2rem,6vw,3rem)] font-semibold text-[#e5e5e5] font-mono">Battle Lobby</h1>
          </div>

          <Card>
            <div className="mb-6">
              <p className="text-sm text-[#a1a1aa] font-mono mb-2">Room Code</p>
              <p className="font-mono text-4xl font-bold tracking-widest text-[#f59e0b]">
                {room?.code}
              </p>
              <p className="mt-2 text-xs text-[#6b7280]">Share this code with your friend</p>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3 text-sm">
              <div className="border border-[#6b7280] bg-[#121212] p-3 rounded-[var(--radius-md)]">
                <p className="text-[#a1a1aa]">Language</p>
                <p className="font-semibold text-[#e5e5e5]">
                  {LANGUAGE_LABELS[room?.language || ''] || room?.language}
                </p>
              </div>
              <div className="border border-[#6b7280] bg-[#121212] p-3 rounded-[var(--radius-md)]">
                <p className="text-[#a1a1aa]">Timer</p>
                <p className="font-semibold text-[#e5e5e5]">{room?.timerMinutes} minutes</p>
              </div>
            </div>

            <div className="mb-6 space-y-3">
              <div className="flex items-center gap-3 border border-[#10b981]/20 bg-[#10b981]/5 p-3 rounded-[var(--radius-md)]">
                <div className="h-2.5 w-2.5 rounded-full bg-[#10b981]" />
                <span className="text-sm text-[#e5e5e5]">{room?.hostUsername} (Host)</span>
              </div>
              <div className={`flex items-center gap-3 border p-3 rounded-[var(--radius-md)] ${
                room?.guestUsername
                  ? 'border-[#10b981]/20 bg-[#10b981]/5'
                  : 'border-[#6b7280] bg-[#121212]'
              }`}>
                <div className={`h-2.5 w-2.5 rounded-full ${
                  room?.guestUsername ? 'bg-[#10b981]' : 'animate-pulse bg-[#6b7280]'
                }`} />
                <span className="text-sm text-[#a1a1aa]">
                  {room?.guestUsername || 'Waiting for opponent...'}
                </span>
              </div>
            </div>

            {opponentStatus && (
              <p className="mb-6 text-sm text-[#f59e0b]">{opponentStatus}</p>
            )}

            {error && (
              <div className="mb-6 bg-[#f43f5e]/10 border border-[#f43f5e]/30 p-4 text-sm text-[#f43f5e] rounded-[var(--radius-lg)]" role="alert">
                {error}
              </div>
            )}

            {isHost && room?.guestUsername && (
              <Button
                onClick={handleStartBattle}
                className="w-full"
              >
                Start Battle!
              </Button>
            )}

            {!isHost && (
              <p className="text-sm text-[#a1a1aa]">
                Waiting for host to start the battle...
              </p>
            )}
          </Card>
        </div>
      </div>
    );
  }

  if (screen === 'countdown') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-[#f59e0b] font-mono">Get Ready</p>
          <div className="mt-4 text-[clamp(4rem,20vw,9rem)] font-bold text-[#e5e5e5] font-mono tabular-nums motion-reduce:animate-none animate-pulse">
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
              <p className="text-xs text-slate-400">
                Write your solution as a function — e.g., def twoSum(nums, target): ...
              </p>

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

  // Persistent aria-live announcements for screen readers
  const getAnnouncement = () => {
    if (opponentStatus) return opponentStatus;
    if (battleResult) {
      if (!battleResult.winner) return `Battle ended in a draw. ${battleResult.reason}`;
      const myId = userId;
      const iWon = battleResult.winner === myId;
      if (iWon) return `You won the battle. ${battleResult.reason}`;
      return `${battleResult.winnerUsername} won the battle. ${battleResult.reason}`;
    }
    if (error) return error;
    return '';
  };

  if (screen === 'result') {
    const myId = userId;
    const iWon = battleResult?.winner === myId;
    const isDraw = !battleResult?.winner;

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4">
        {/* Visually-hidden aria-live region */}
        <div className="sr-only" aria-live="polite" role="status">
          {getAnnouncement()}
        </div>

        <div className="w-full max-w-md">
          <Card className={`${
            isDraw
              ? 'border-[#6b7280]'
              : iWon
              ? 'border-[#10b981]'
              : 'border-[#f43f5e]'
          }`}>
            <div className="flex justify-center mb-6">
              {isDraw ? (
                <Handshake className="h-16 w-16 text-[#a1a1aa]" />
              ) : iWon ? (
                <Trophy className="h-16 w-16 text-[#10b981]" />
              ) : (
                <X className="h-16 w-16 text-[#f43f5e]" />
              )}
            </div>
            <h1 className={`text-center text-2xl font-semibold ${
              isDraw ? 'text-[#e5e5e5]' : iWon ? 'text-[#10b981]' : 'text-[#f43f5e]'
            } font-mono`}>
              {isDraw ? 'Draw!' : iWon ? 'You Won!' : 'You Lost'}
            </h1>
            {battleResult?.winnerUsername && !isDraw && (
              <p className="mt-2 text-center text-sm text-[#a1a1aa]">
                {iWon ? 'Congratulations!' : `${battleResult.winnerUsername} won`}
              </p>
            )}
            <p className="mt-1 text-center text-sm text-[#6b7280]">{battleResult?.reason}</p>

            {/* Submission breakdown */}
            {battleResult?.submissions && room && (
              <div className="mt-6 space-y-2">
                {[
                  { id: room.hostId, username: room.hostUsername },
                  { id: room.guestId, username: room.guestUsername },
                ].map((player) => {
                  const sub = battleResult.submissions[player.id || ''];
                  return (
                    <div key={player.id} className="flex items-center justify-between border border-[#6b7280] bg-[#121212] px-4 py-3 rounded-[var(--radius-md)]">
                      <span className="text-sm font-medium text-[#e5e5e5]">{player.username}</span>
                      <span className="text-sm text-[#a1a1aa]">
                        {sub ? `${sub.passedTests}/${sub.totalTests} tests` : 'No submission'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <Button
              onClick={() => {
                setScreen('lobby');
                setRoom(null);
                setBattleResult(null);
                setSubmitResult(null);
                setOpponentStatus('');
                setError('');
                setCode('');
              }}
              className="mt-6 w-full"
            >
              Play Again
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
