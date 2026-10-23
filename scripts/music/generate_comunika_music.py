"""
Música original para el video Comunika 2026 de GĚRENS, generada 100 % por código.
No usa samples ni loops de terceros: es libre de derechos y se puede usar, modificar
y distribuir sin restricciones.

Estilo: pop electrónico corporativo, 120 BPM, Re mayor. Está sincronizada con
src/compositions/comunika/timeline.ts (golpes en el logo, whooshes en las transiciones).

Uso:
    python3 scripts/music/generate_comunika_music.py salida_sin_normalizar.wav
    ffmpeg -i salida_sin_normalizar.wav -af loudnorm=I=-14:TP=-1.5:LRA=9 -ar 48000 \
        public/audio/comunika-2026-musica.wav
Requiere numpy y scipy.
"""

import sys
import wave

import numpy as np
from scipy import signal

SR = 48000
DUR = 30.0
N = int(SR * DUR)
BEAT = 0.5  # 120 BPM
BAR = 2.0
rng = np.random.default_rng(2026)

# --- Momentos del video (en segundos), según timeline.ts y BrandReveal.tsx -----------
FPS = 30
SCENE_STARTS = [120 / FPS, 240 / FPS, 360 / FPS, 570 / FPS, 720 / FPS]  # 4, 8, 12, 19, 24
INTRO_CARON_LANDS = 15 / FPS  # 0.5 s
INTRO_CARON_ON_E = 45 / FPS  # 1.5 s
INTRO_DESCRIPTOR = 60 / FPS  # 2.0 s
OUTRO_START = 720 / FPS  # 24 s
OUTRO_REVEAL = 8  # OUTRO_REVEAL_START en Comunika2026.tsx
OUTRO_CARON_LANDS = OUTRO_START + (OUTRO_REVEAL + 15) / FPS  # ~24.77 s
OUTRO_CARON_ON_E = OUTRO_START + (OUTRO_REVEAL + 45) / FPS  # ~25.77 s
OUTRO_DESCRIPTOR = OUTRO_START + (OUTRO_REVEAL + 60) / FPS  # ~26.27 s

# --- Armonía: un acorde por compás (15 compases de 2 s) --------------------------------
CHORDS = {
    "D": {"pad": [62, 66, 69], "root": 38},
    "A": {"pad": [61, 64, 69], "root": 33},
    "Bm": {"pad": [62, 66, 71], "root": 35},
    "G": {"pad": [62, 67, 71], "root": 31},
}
PROGRESSION = ["G", "A", "D", "A", "Bm", "G", "D", "A", "Bm", "G", "Bm", "A", "D", "G", "D"]


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def stereo(x, pan=0.0):
    a = (pan + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)], axis=1)


def place(buf, x, start, gain=1.0, pan=0.0):
    if x.ndim == 1:
        x = stereo(x, pan)
    i = int(round(start * SR))
    if i >= N:
        return
    if i < 0:
        x = x[-i:]
        i = 0
    j = min(N, i + len(x))
    buf[i:j] += gain * x[: j - i]


def sos(kind, f, order=2):
    return signal.butter(order, f, kind, fs=SR, output="sos")


def filt(x, kind, f, order=2):
    return signal.sosfilt(sos(kind, f, order), x, axis=0)


def tt(dur):
    return np.arange(int(dur * SR)) / SR


def saw(freq, dur, phase0=0.0):
    """Diente de sierra con corrección PolyBLEP (sin aliasing audible)."""
    n = int(dur * SR)
    dt = freq / SR
    ph = (phase0 + dt * np.arange(n)) % 1.0
    y = 2 * ph - 1
    m = ph < dt
    x = ph[m] / dt
    y[m] -= x + x - x * x - 1
    m = ph > 1 - dt
    x = (ph[m] - 1) / dt
    y[m] -= x * x + x + x + 1
    return y


def adsr(n, a, d, s, r, sustain_len=None):
    a, d, r = int(a * SR), int(d * SR), int(r * SR)
    env = np.ones(n) * s
    env[: min(a, n)] = np.linspace(0, 1, a)[: min(a, n)] if a > 0 else 1
    if a < n:
        e = min(a + d, n)
        env[a:e] = np.linspace(1, s, d)[: e - a] if d > 0 else s
    if r > 0 and n > r:
        env[n - r :] *= np.linspace(1, 0, r)
    return env


def svf(x, cutoff, q=0.9, mode="band"):
    """Filtro de estado variable con frecuencia de corte variable en el tiempo."""
    cutoff = np.broadcast_to(cutoff, x.shape)
    k = 1.0 / q
    ic1 = ic2 = 0.0
    out = np.empty_like(x)
    g_all = np.tan(np.pi * np.clip(cutoff, 20, SR * 0.45) / SR)
    for n in range(len(x)):
        g = g_all[n]
        a1 = 1.0 / (1.0 + g * (g + k))
        a2 = g * a1
        a3 = g * a2
        v3 = x[n] - ic2
        v1 = a1 * ic1 + a2 * v3
        v2 = ic2 + a2 * ic1 + a3 * v3
        ic1 = 2 * v1 - ic1
        ic2 = 2 * v2 - ic2
        out[n] = v1 if mode == "band" else (v2 if mode == "low" else x[n] - k * v1 - v2)
    return out


# --- Instrumentos ----------------------------------------------------------------------
def kick(vel=1.0):
    t = tt(0.5)
    f = 56 + 130 * np.exp(-t / 0.028)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.16)
    click = filt(rng.standard_normal(len(t)), "high", 2500) * np.exp(-t / 0.004) * 0.35
    return np.tanh(1.6 * (body + click)) * vel


def clap(vel=1.0):
    t = tt(0.35)
    nz = filt(rng.standard_normal(len(t)), "band", [900, 3200])
    env = np.zeros(len(t))
    for d in (0.0, 0.011, 0.022):
        env += np.where(t >= d, np.exp(-(t - d) / 0.006), 0) * (t < d + 0.03)
    env += np.where(t >= 0.03, 0.55 * np.exp(-(t - 0.03) / 0.11), 0)
    return nz * env * vel


def snare(vel=1.0):
    t = tt(0.25)
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.05)
    nz = filt(rng.standard_normal(len(t)), "band", [1200, 9000]) * np.exp(-t / 0.09)
    return (0.6 * tone + nz) * vel


def hat(open_=False, vel=1.0):
    t = tt(0.4 if open_ else 0.08)
    nz = filt(rng.standard_normal(len(t)), "high", 7500, order=4)
    return nz * np.exp(-t / (0.2 if open_ else 0.028)) * vel


def shaker(vel=1.0):
    t = tt(0.09)
    nz = filt(rng.standard_normal(len(t)), "band", [4500, 11000])
    env = np.minimum(t / 0.012, 1) * np.exp(-t / 0.035)
    return nz * env * vel


def crash(vel=1.0, dur=2.6):
    t = tt(dur)
    l = filt(rng.standard_normal(len(t)), "high", 3800, order=4)
    r = filt(rng.standard_normal(len(t)), "high", 3800, order=4)
    metal = sum(np.sin(2 * np.pi * f * t) for f in (3125, 4410, 5793, 7220)) * 0.08
    env = np.exp(-t / 0.75)
    return np.stack([(l + metal) * env, (r + metal) * env], 1) * vel


def supersaw_note(m, dur, detunes=(-22, -12, -5, 0, 5, 12, 22)):
    left = np.zeros(int(dur * SR))
    right = np.zeros(int(dur * SR))
    for i, c in enumerate(detunes):
        v = saw(hz(m) * 2 ** (c / 1200), dur, rng.random())
        if i % 2 == 0:
            left += v * (1.0 if c != 0 else 0.7)
        else:
            right += v
        if c == 0:
            right += v * 0.7
    return np.stack([left, right], 1) / len(detunes)


def pluck(m, dur=0.32, bright=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    raw = 0.6 * saw(hz(m), dur) + 0.4 * np.sign(np.sin(2 * np.pi * hz(m) * t))
    b = filt(raw, "low", 5200 * bright)
    d = filt(raw, "low", 900)
    env_f = np.exp(-t / 0.05)
    amp = np.minimum(t / 0.003, 1) * np.exp(-t / 0.16)
    return (env_f * b + (1 - env_f) * d) * amp


def bell(m, dur=2.2, vel=1.0):
    t = tt(dur)
    f = hz(m)
    index = 2.2 * np.exp(-t / 0.25)
    mod = np.sin(2 * np.pi * f * 3.5 * t) * index
    car = np.sin(2 * np.pi * f * t + mod)
    return car * np.exp(-t / 0.7) * np.minimum(t / 0.002, 1) * vel


def impact(vel=1.0):
    t = tt(2.0)
    f = 70 * np.exp(-t / 0.5) + 42
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.38)
    nz = filt(rng.standard_normal(len(t)), "band", [150, 4000]) * np.exp(-t / 0.16) * 0.9
    return np.tanh(1.3 * (boom + nz)) * vel


def whoosh(dur=0.75, vel=1.0, up_only=False):
    t = tt(dur)
    x = t / dur
    nz = rng.standard_normal(len(t))
    if up_only:
        fc = 250 * (40 ** x)
        env = x**2
    else:
        fc = 300 + 3800 * np.sin(np.pi * np.clip(x * 1.1, 0, 1))
        env = np.sin(np.pi * x) ** 2
    y = svf(nz, fc, q=1.4, mode="band") * env
    pan = np.linspace(-0.6, 0.6, len(t))
    a = (pan + 1) * np.pi / 4
    return np.stack([y * np.cos(a), y * np.sin(a)], 1) * vel


def riser(dur, vel=1.0):
    t = tt(dur)
    x = t / dur
    nz = rng.standard_normal(len(t))
    y = svf(nz, 300 * (30 ** x), q=2.0, mode="band") * x**2.2
    sweep = np.sin(2 * np.pi * np.cumsum(220 * (4 ** x)) / SR) * x**3 * 0.15
    return (y + sweep) * vel


def reverb_ir(seconds=2.4, rt60=1.9):
    t = tt(seconds)
    env = np.exp(-6.9 * t / rt60)
    ir = np.stack([rng.standard_normal(len(t)), rng.standard_normal(len(t))], 1) * env[:, None]
    ir = filt(ir, "low", 6500)
    ir[: int(0.018 * SR)] = 0  # pre-delay
    return ir / np.sqrt(np.sum(ir**2) / 2)


# --- Buses -----------------------------------------------------------------------------
drums = np.zeros((N, 2))
music = np.zeros((N, 2))  # se le aplica el "bombeo" del kick (sidechain)
fx = np.zeros((N, 2))
verb_send = np.zeros((N, 2))


def bar_chord(t):
    return CHORDS[PROGRESSION[min(int(t // BAR), len(PROGRESSION) - 1)]]


# Pad: acordes sostenidos, más oscuros en la intro y abiertos en el cuerpo.
pad = np.zeros((N, 2))
for b, name in enumerate(PROGRESSION):
    start = b * BAR
    dur = BAR + 0.35
    for m in CHORDS[name]["pad"] + [CHORDS[name]["pad"][0] - 12]:
        note = supersaw_note(m, dur)
        note *= adsr(len(note), 0.25 if b > 0 else 0.9, 0.3, 0.85, 0.35)[:, None]
        place(pad, note, start, 0.9)
pad_dark = filt(pad, "low", 650)
pad_bright = filt(filt(pad, "low", 4200), "high", 160)
tl = np.arange(N) / SR
open_amt = np.interp(tl, [0, 3.9, 4.0, 26.0, 28.0, 30.0], [0.0, 0.55, 1.0, 1.0, 0.45, 0.2])[:, None]
pad_level = np.interp(tl, [0, 0.5, 4.0, 4.01, 26.0, 26.5, 30.0], [0.5, 0.8, 0.9, 0.6, 0.6, 1.0, 1.0])[:, None]
music += (pad_dark * (1 - open_amt) + pad_bright * open_amt) * pad_level * 1.25

# Bajo: sub sostenido + bajo a contratiempo (estilo house), del compás 3 al 13.
for b in range(2, 13):
    ch = CHORDS[PROGRESSION[b]]
    t0 = b * BAR
    sub = np.sin(2 * np.pi * hz(ch["root"]) * tt(BAR)) * adsr(int(BAR * SR), 0.01, 0.1, 1.0, 0.03)
    place(music, sub, t0, 0.12)
    for k in range(4):
        tn = t0 + k * BEAT + BEAT / 2
        n = saw(hz(ch["root"] + 12), 0.22)
        n = filt(n, "low", 850) * adsr(len(n), 0.004, 0.08, 0.6, 0.06)
        place(music, n, tn, 0.36)

# Arpegio: 8vos en la intro y compases 5-6, 16vos en el cuerpo (compases 7-13).
def arp_notes(name):
    v = sorted(CHORDS[name]["pad"])
    return v + [x + 12 for x in v]

pattern = [0, 2, 4, 1, 3, 5, 4, 2]
step_i = 0
t = INTRO_CARON_LANDS
while t < 28.0 - 1e-6:
    b = int(t // BAR)
    if b in (2, 3):  # compases 3-4: sin arpegio, para que el tema crezca
        t = 4 * BAR
        continue
    sixteenth = 6 <= b <= 12
    step = BEAT / 4 if sixteenth else BEAT / 2
    notes = arp_notes(PROGRESSION[b])
    m = notes[pattern[step_i % len(pattern)]] + 12
    level = 0.2 if b < 2 else (0.26 if not sixteenth else 0.24)
    accent = 1.0 if (step_i % 4 == 0) else 0.75
    pan = -0.35 if step_i % 2 == 0 else 0.35
    place(music, pluck(m, bright=0.6 if b < 2 else 1.0), t, level * accent, pan)
    step_i += 1
    t += step

# Acorde final: Re mayor que queda sonando sobre el logo.
for m in [50, 62, 66, 69, 74]:
    note = supersaw_note(m, 2.0)
    note *= (np.exp(-tt(2.0) / 0.9) * np.minimum(tt(2.0) / 0.01, 1))[:, None]
    place(fx, filt(note, "low", 3200), 28.0, 0.22)
    place(verb_send, filt(note, "low", 3200), 28.0, 0.12)
place(fx, impact(0.6), 28.0)

# Batería.
groove_beats = np.arange(4.0, 26.0, BEAT)
for tb in groove_beats:
    place(drums, kick(), tb, 0.95)
    in_bar = (tb % BAR) / BEAT  # 0..3
    fill = 18.5 <= tb < 19.0 or 23.0 <= tb < 24.0
    if in_bar in (1, 3) and not fill:
        c = clap()
        place(drums, c, tb, 0.6, 0.05)
        place(verb_send, stereo(c), tb, 0.18)
    place(drums, hat(vel=0.9), tb + BEAT / 2, 0.22, 0.25)
    if in_bar == 3 and tb >= 8.0:
        place(drums, hat(open_=True), tb + BEAT / 2, 0.12, 0.25)
    if 12.0 <= tb < 24.0:
        for k in range(4):
            place(drums, shaker(vel=1.0 if k % 2 else 0.6), tb + k * BEAT / 4, 0.1, -0.3)
# Redobles: antes del cambio de 19 s y la subida a la claqueta final.
for k in range(4):
    place(drums, snare(0.5 + 0.12 * k), 18.5 + k * BEAT / 8 + 0.25, 0.3)
for k in range(16):
    tk = 23.0 + k * (1.0 / 16)
    place(drums, snare(0.35 + 0.04 * k), tk, 0.3, 0.1 * (-1) ** k)
# Redoble de la intro hacia la primera escena.
for k in range(12):
    tk = 3.0 + k * (1.0 / 12)
    place(drums, snare(0.25 + 0.05 * k), tk, 0.28)
for tc, v in ((4.0, 1.0), (12.0, 1.0), (19.0, 0.6), (24.0, 1.1)):
    place(drums, crash(v), tc, 0.2)

# Efectos sincronizados con el logo.
place(fx, impact(1.0), INTRO_CARON_LANDS, 0.55)
place(verb_send, stereo(impact(1.0)), INTRO_CARON_LANDS, 0.15)
place(fx, whoosh(0.5, up_only=True), INTRO_CARON_LANDS - 0.5, 0.35)
for when in (INTRO_CARON_ON_E, OUTRO_CARON_ON_E):
    b = bell(86, vel=1.0)
    place(fx, b, when, 0.16)
    place(verb_send, stereo(b), when, 0.2)
for when in (INTRO_DESCRIPTOR, OUTRO_DESCRIPTOR):
    for k, m in enumerate([81, 86, 90, 93]):
        b = bell(m, dur=1.6, vel=0.8)
        place(fx, b, when + 0.06 + k * 0.045, 0.08, -0.4 + 0.27 * k)
        place(verb_send, stereo(b), when + 0.06 + k * 0.045, 0.1)
    place(fx, whoosh(0.6), when - 0.1, 0.25)
place(fx, impact(0.9), OUTRO_CARON_LANDS, 0.55)
place(fx, whoosh(0.5, up_only=True), OUTRO_CARON_LANDS - 0.5, 0.3)

# Whoosh en cada transición en V.
for s in SCENE_STARTS:
    place(fx, whoosh(0.7), s - 0.2, 0.3)

# Subidas (risers) antes de la primera escena y de la claqueta final.
place(fx, riser(1.6), 4.0 - 1.6, 0.35)
place(fx, riser(2.0), 24.0 - 2.0, 0.35)

# --- Mezcla ---------------------------------------------------------------------------
# Sidechain: la música baja un poco en cada golpe del kick (efecto "bombeo").
kick_train = np.zeros(N)
for tb in groove_beats:
    kick_train[int(tb * SR)] = 1.0
kernel = np.exp(-np.arange(int(0.3 * SR)) / (0.09 * SR))
duck = 1 - 0.55 * np.clip(signal.fftconvolve(kick_train, kernel)[:N], 0, 1)
music *= duck[:, None]

ir = reverb_ir()
send_total = verb_send + 0.12 * music
wet = np.stack([signal.fftconvolve(send_total[:, c], ir[:, c])[:N] for c in range(2)], 1)

mix = drums + music + fx + 0.22 * wet
mix = filt(mix, "high", 40, order=4)
mix = np.tanh(mix * 1.1) / 1.1  # saturación suave para pegar la mezcla

# Fade out final, en sincronía con el fade del video.
fade = np.interp(tl, [0, 29.2, 29.95, 30.0], [1, 1, 0, 0])
mix *= fade[:, None]
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.89

out = sys.argv[1] if len(sys.argv) > 1 else "comunika-2026-musica-raw.wav"
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())
print(f"OK {out}: {N / SR:.2f} s")
