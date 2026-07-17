import { useState, useEffect } from 'react';
import { Wallet, QrCode, X, ArrowUpRight, Check, Clock, Eye, User, LayoutDashboard, Lock, Plus, ExternalLink, Copy, Sparkles, AtSign, FileText, Shield } from 'lucide-react';
import QRCode from 'qrcode';

// Types
interface Creator {
  name: string;
  handle: string;
  bio: string;
  wallet: string;
  avatar: null | string;
}

// Default mock creator
const defaultCreator: Creator = {
  name: 'Maya Chen',
  handle: '@mayachen',
  bio: 'Writing about decentralized systems, privacy, and the future of the internet.',
  wallet: '0x72b5...8f3a',
  avatar: null,
};

const dashboardStats = {
  totalBalance: 2847.50,
  tipCount: 142,
};

// Mock shielded transfer function - wire to Starknet STRK20 SDK
async function sendShieldedTip(amount: number): Promise<{ success: boolean; timestamp: number }> {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return { success: true, timestamp: Date.now() };
}

// Mock wallet connection
async function connectWallet(): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 800));
  return '0x' + Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('') + '...8f3a';
}

function Avatar({ name, size = 'lg' }: { name: string; size?: 'lg' | 'sm' }) {
  const colors = ['#C68B3C', '#6B8F71', '#8B7355'];
  const initial = name.charAt(0).toUpperCase();
  const sizeClasses = size === 'lg' ? 'w-16 h-16 text-2xl' : 'w-10 h-10 text-sm';
  return (
    <div 
      className={`${sizeClasses} rounded-full flex items-center justify-center font-display font-semibold`}
      style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}
    >
      {initial}
    </div>
  );
}

function QRDisplay({ url, size = 160 }: { url: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string>('');
  
  useEffect(() => {
    QRCode.toDataURL(url, { 
      width: size, 
      margin: 1,
      color: { dark: '#EDEAE0', light: '#14161A' }
    }).then(setDataUrl);
  }, [url, size]);
  
  return dataUrl ? (
    <img src={dataUrl} alt="QR Code" className="rounded-lg" />
  ) : (
    <div className="w-40 h-40 rounded-lg bg-[var(--surface)] animate-pulse" />
  );
}

function SuccessAnimation({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'typing' | 'static' | 'stamp'>('typing');
  const [displayedChars, setDisplayedChars] = useState(0);
  const walletAddress = '0x72b5aF8c3E2D1B9f4E8A7C2d5F3b1E9a8C4D7f3a';
  const timestamp = new Date().toLocaleString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    month: 'short',
    day: 'numeric'
  });

  useEffect(() => {
    if (phase === 'typing') {
      const interval = setInterval(() => {
        setDisplayedChars(prev => {
          if (prev >= walletAddress.length) {
            clearInterval(interval);
            setTimeout(() => setPhase('static'), 300);
            return prev;
          }
          return prev + 1;
        });
      }, 40);
      return () => clearInterval(interval);
    } else if (phase === 'static') {
      const timeout = setTimeout(() => setPhase('stamp'), 800);
      return () => clearTimeout(timeout);
    } else if (phase === 'stamp') {
      const timeout = setTimeout(onComplete, 2500);
      return () => clearTimeout(timeout);
    }
  }, [phase, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg)]/95 backdrop-blur-sm">
      <div className="text-center">
        {phase === 'typing' && (
          <div className="font-mono text-sm text-[var(--muted)] tracking-wider">
            <span className="text-[var(--accent)]">{walletAddress.slice(0, displayedChars)}</span>
            <span className="opacity-30">{walletAddress.slice(displayedChars)}</span>
          </div>
        )}
        {phase === 'static' && (
          <div className="font-mono text-sm text-[var(--muted)] opacity-30 select-none blur-sm">
            {walletAddress.split('').map((char, i) => (
              <span 
                key={i} 
                style={{ opacity: Math.random() * 0.5 + 0.2 }}
              >
                {char}
              </span>
            ))}
          </div>
        )}
        {phase === 'stamp' && (
          <div className="animate-stamp">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-[var(--success)]/20 flex items-center justify-center">
                <Check className="w-6 h-6 text-[var(--success)]" strokeWidth={3} />
              </div>
            </div>
            <p className="font-display text-xl text-[var(--text)]">Sent. No trace.</p>
            <p className="font-mono text-xs text-[var(--muted)] mt-2 flex items-center justify-center gap-2">
              <Clock className="w-3 h-3" />
              {timestamp}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function QRModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg)]" onClick={onClose}>
      <div className="relative max-w-sm w-full" onClick={e => e.stopPropagation()}>
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="ticket rounded-2xl p-8 text-center">
          <p className="text-sm text-[var(--muted)] mb-6">Scan to send support</p>
          <div className="flex justify-center mb-6">
            <QRDisplay url={url} size={280} />
          </div>
          <p className="font-mono text-xs text-[var(--muted)]">{url}</p>
        </div>
      </div>
    </div>
  );
}

function CreatePageModal({ 
  onClose, 
  onCreate 
}: { 
  onClose: () => void; 
  onCreate: (creator: Creator) => void;
}) {
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isCreated, setIsCreated] = useState(false);
  const [copied, setCopied] = useState(false);

  const generatedUrl = handle ? `privatip.io/${handle.replace('@', '')}` : '';

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    const address = await connectWallet();
    setWalletAddress(address);
    setIsConnecting(false);
  };

  const handleCreate = () => {
    if (!name || !handle || !walletAddress) return;
    setIsCreated(true);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(`https://${generatedUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFinish = () => {
    onCreate({
      name,
      handle: handle.startsWith('@') ? handle : `@${handle}`,
      bio: bio || 'No bio yet.',
      wallet: walletAddress!,
      avatar: null,
    });
    onClose();
  };

  const isFormValid = name.trim() && handle.trim() && walletAddress;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg)]/95 backdrop-blur-md" onClick={onClose}>
      <div 
        className="relative w-full max-w-lg bg-[var(--surface)] rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold">Create Your Page</h2>
              <p className="text-xs text-[var(--muted)]">Set up your private tipping page</p>
            </div>
          </div>
        </div>

        {!isCreated ? (
          <>
            {/* Form Section */}
            <div className="px-6 pb-6 space-y-5">
              {/* Divider */}
              <div className="h-px bg-[var(--border)]" />
              
              {/* Name Field */}
              <div>
                <label className="flex items-center gap-2 text-xs text-[var(--muted)] mb-2 font-medium uppercase tracking-wider">
                  <User className="w-3.5 h-3.5" />
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl py-3 px-4 text-[var(--text)] placeholder:text-[var(--muted)]/40 focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 transition-all"
                />
              </div>

              {/* Handle Field */}
              <div>
                <label className="flex items-center gap-2 text-xs text-[var(--muted)] mb-2 font-medium uppercase tracking-wider">
                  <AtSign className="w-3.5 h-3.5" />
                  Handle
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] font-mono">@</span>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value.replace('@', '').replace(/\s/g, ''))}
                    placeholder="yourhandle"
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl py-3 pl-9 pr-4 text-[var(--text)] placeholder:text-[var(--muted)]/40 focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 transition-all font-mono"
                  />
                </div>
                {handle && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--accent)]">
                    <ExternalLink className="w-3 h-3" />
                    <span className="font-mono">{generatedUrl}</span>
                  </div>
                )}
              </div>

              {/* Bio Field */}
              <div>
                <label className="flex items-center gap-2 text-xs text-[var(--muted)] mb-2 font-medium uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5" />
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell supporters what you do..."
                  rows={3}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl py-3 px-4 text-[var(--text)] placeholder:text-[var(--muted)]/40 focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 transition-all resize-none"
                />
                <p className="text-xs text-[var(--muted)] mt-1.5">{bio.length}/200</p>
              </div>

              {/* Wallet Field */}
              <div>
                <label className="flex items-center gap-2 text-xs text-[var(--muted)] mb-2 font-medium uppercase tracking-wider">
                  <Shield className="w-3.5 h-3.5" />
                  Wallet Address
                </label>
                {walletAddress ? (
                  <div className="flex items-center gap-3 p-4 bg-[var(--success)]/5 border border-[var(--success)]/20 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-[var(--success)]/10 flex items-center justify-center">
                      <Check className="w-4 h-4 text-[var(--success)]" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[var(--success)] font-medium">Wallet Connected</p>
                      <p className="font-mono text-sm text-[var(--text)] truncate">{walletAddress}</p>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleConnectWallet}
                    disabled={isConnecting}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-dashed border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all group"
                  >
                    <Wallet className={`w-4 h-4 ${isConnecting ? 'animate-pulse' : ''} text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors`} />
                    <span className="text-sm text-[var(--muted)] group-hover:text-[var(--text)] transition-colors">
                      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-[var(--bg)]/50 border-t border-[var(--border)]">
              <button
                onClick={handleCreate}
                disabled={!isFormValid}
                className={`w-full py-3.5 rounded-xl font-medium text-sm transition-all ${
                  !isFormValid
                    ? 'bg-[var(--border)] text-[var(--muted)] cursor-not-allowed'
                    : 'bg-[var(--accent)] text-[var(--bg)] hover:bg-[var(--accent)]/90 shadow-lg shadow-[var(--accent)]/20'
                }`}
              >
                Create Page
              </button>
            </div>
          </>
        ) : (
          /* Success State */
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-[var(--success)]/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-[var(--success)]" strokeWidth={2.5} />
              </div>
              <h2 className="font-display text-2xl font-semibold mb-1">Page Created</h2>
              <p className="text-sm text-[var(--muted)]">Your private tipping page is live</p>
            </div>

            {/* Preview Card */}
            <div className="ticket rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <Avatar name={name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{name}</p>
                  <p className="text-xs text-[var(--muted)]">@{handle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-[var(--bg)] rounded-lg px-3 py-2">
                <span className="font-mono text-xs text-[var(--accent)] truncate flex-1">{generatedUrl}</span>
                <button
                  onClick={handleCopyUrl}
                  className="p-1.5 rounded-md hover:bg-[var(--surface)] transition-colors flex-shrink-0"
                  aria-label="Copy URL"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-[var(--success)]" />
                  ) : (
                    <Copy className="w-4 h-4 text-[var(--muted)]" />
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-3.5 rounded-xl font-medium text-sm bg-[var(--accent)] text-[var(--bg)] hover:bg-[var(--accent)]/90 transition-all"
            >
              Go to My Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CreatorPage({ creator }: { creator: Creator }) {
  const [walletConnected, setWalletConnected] = useState(false);
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const tipUrl = `https://privatip.io/${creator.handle.replace('@', '')}`;

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    setWalletConnected(true);
    setIsConnecting(false);
  };

  const handleSendTip = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setIsSending(true);
    const result = await sendShieldedTip(parseFloat(amount));
    setIsSending(false);
    if (result.success) {
      setShowSuccess(true);
    }
  };

  const handleSuccessComplete = () => {
    setShowSuccess(false);
    setAmount('');
  };

  return (
    <>
      {showSuccess && <SuccessAnimation onComplete={handleSuccessComplete} />}
      {showQRModal && <QRModal url={tipUrl} onClose={() => setShowQRModal(false)} />}
      
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in-up">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-[var(--accent)]" />
            <span className="font-display text-lg font-semibold">Privatip</span>
          </div>
          <button
            onClick={handleConnectWallet}
            disabled={walletConnected || isConnecting}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              walletConnected 
                ? 'bg-[var(--success)]/20 text-[var(--success)] cursor-default' 
                : isConnecting
                  ? 'bg-[var(--accent)]/50 text-[var(--bg)] cursor-wait'
                  : 'bg-[var(--accent)] text-[var(--bg)] hover:bg-[var(--accent)]/90'
            }`}
          >
            <Wallet className="w-4 h-4" />
            {walletConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Connect'}
          </button>
        </div>

        {/* Ticket Card */}
        <div className="ticket rounded-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {/* Stub Section */}
          <div className="p-6">
            {/* Creator Info */}
            <div className="flex items-start gap-4 mb-6">
              <Avatar name={creator.name} />
              <div className="flex-1 min-w-0">
                <h1 className="font-display text-xl font-semibold">{creator.name}</h1>
                <p className="text-sm text-[var(--muted)]">{creator.handle}</p>
              </div>
            </div>
            
            <p className="text-sm text-[var(--muted)] leading-relaxed mb-6">{creator.bio}</p>

            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-xs text-[var(--muted)] mb-2 font-medium uppercase tracking-wider">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[var(--muted)]">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg py-3 pl-8 pr-4 font-mono text-lg text-[var(--text)] placeholder:text-[var(--muted)]/50 focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendTip}
              disabled={!walletConnected || !amount || parseFloat(amount) <= 0 || isSending}
              className={`w-full py-3 rounded-lg font-medium text-sm transition-all ${
                !walletConnected || !amount || parseFloat(amount) <= 0
                  ? 'bg-[var(--border)] text-[var(--muted)] cursor-not-allowed'
                  : isSending
                    ? 'bg-[var(--accent)]/50 text-[var(--bg)] cursor-wait'
                    : 'bg-[var(--accent)] text-[var(--bg)] hover:bg-[var(--accent)]/90'
              }`}
            >
              {isSending ? 'Sending...' : 'Send support'}
            </button>
            
            {!walletConnected && (
              <p className="text-xs text-[var(--muted)] text-center mt-3">
                Connect wallet to continue
              </p>
            )}
          </div>

          {/* Perforation Divider */}
          <div className="perforation" />

          {/* Tear-off QR Section */}
          <div className="p-6 bg-[var(--bg)]/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <QRDisplay url={tipUrl} size={64} />
                <div>
                  <p className="text-xs text-[var(--muted)]">Scan to tip</p>
                  <p className="font-mono text-xs text-[var(--text-muted)]">privatip.io/{creator.handle.replace('@', '')}</p>
                </div>
              </div>
              <button
                onClick={() => setShowQRModal(true)}
                className="p-2 rounded-lg bg-[var(--surface)] hover:bg-[var(--border)] transition-colors"
                aria-label="View large QR"
              >
                <Eye className="w-4 h-4 text-[var(--muted)]" />
              </button>
            </div>
          </div>
        </div>

        {/* Privacy Note */}
        <p className="text-xs text-[var(--muted)] text-center mt-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Shielded transfers. Your identity and amount stay private.
        </p>
      </div>
    </>
  );
}

function Dashboard({ creator }: { creator: Creator }) {
  const tipUrl = `https://privatip.io/${creator.handle.replace('@', '')}`;
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(tipUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-8 animate-fade-in-up">
        <LayoutDashboard className="w-5 h-5 text-[var(--accent)]" />
        <span className="font-display text-lg font-semibold">Dashboard</span>
      </div>

      {/* Creator Card */}
      <div className="glass rounded-xl p-5 mb-6 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        <div className="flex items-center gap-3 mb-4">
          <Avatar name={creator.name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="font-medium">{creator.name}</p>
            <p className="text-sm text-[var(--muted)]">{creator.handle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-[var(--bg)] rounded-lg px-3 py-2 font-mono text-xs text-[var(--accent)] truncate">
            {tipUrl}
          </div>
          <button
            onClick={handleCopyUrl}
            className="p-2 rounded-lg bg-[var(--surface)] hover:bg-[var(--border)] transition-colors flex-shrink-0"
            aria-label="Copy URL"
          >
            {copied ? (
              <Check className="w-4 h-4 text-[var(--success)]" />
            ) : (
              <Copy className="w-4 h-4 text-[var(--muted)]" />
            )}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="ticket rounded-xl p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-2">Total Balance</p>
          <p className="font-display text-3xl font-semibold text-[var(--accent)]">
            ${dashboardStats.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="ticket rounded-xl p-6 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-2">Tips Received</p>
          <p className="font-display text-3xl font-semibold">
            {dashboardStats.tipCount}
          </p>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="glass rounded-xl p-5 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-[var(--success)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium mb-1">Private by design</p>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Individual tip amounts and sender identities are never visible. 
              Only aggregate totals are shown.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity (anonymized) */}
      <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
        <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wider mb-4">Recent Activity</h2>
        <div className="space-y-2">
          {[
            { time: '2 min ago', action: 'Tip received' },
            { time: '15 min ago', action: 'Tip received' },
            { time: '1 hour ago', action: 'Tip received' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-[var(--border)]">
              <span className="text-sm">{item.action}</span>
              <span className="font-mono text-xs text-[var(--muted)]">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeView, setActiveView] = useState<'creator' | 'dashboard'>('creator');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creator, setCreator] = useState<Creator>(defaultCreator);

  const handleCreatePage = (newCreator: Creator) => {
    setCreator(newCreator);
    setActiveView('creator');
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {showCreateModal && (
        <CreatePageModal 
          onClose={() => setShowCreateModal(false)} 
          onCreate={handleCreatePage}
        />
      )}

      {/* Navigation */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-[var(--bg)]/80 border-b border-[var(--border)]">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveView('creator')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeView === 'creator'
                    ? 'bg-[var(--accent)]/20 text-[var(--accent)]'
                    : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]'
                }`}
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Creator Page</span>
                <span className="sm:hidden">Page</span>
              </button>
              <button
                onClick={() => setActiveView('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeView === 'dashboard'
                    ? 'bg-[var(--accent)]/20 text-[var(--accent)]'
                    : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Stats</span>
              </button>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--surface)] hover:bg-[var(--border)] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Page</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      {activeView === 'creator' ? <CreatorPage creator={creator} /> : <Dashboard creator={creator} />}
    </div>
  );
}
