import { motion } from "framer-motion";

export type FinoMood = "happy" | "focused" | "encouraging" | "sad";
export function Fino({ mood = "happy", reading = false, className = "" }: { mood?: FinoMood; reading?: boolean; className?: string }) {
  return <motion.svg whileTap={{ rotate: [-6, 6, 0], y: -5 }} className={`fino-svg ${className}`} viewBox="0 0 200 200" role="img" aria-label={`Fino le renard ${mood === "sad" ? "triste" : mood === "focused" ? "concentré" : "souriant"}`}>
    <ellipse className="shadow" cx="101" cy="182" rx="69" ry="9" />
    <path className="fur" d="M134 159 Q192 169 174 110 Q167 137 145 130 Z" />
    <path className="paper" d="M174 110 Q187 125 179 144 L164 131Z" />
    <path className="fur" d="M66 132 Q59 172 75 183 L131 183 Q145 164 132 131Z" />
    <ellipse className="paper" cx="101" cy="157" rx="22" ry="24" />
    <path className="fur" d="M46 75 L45 18 Q47 13 53 20 L82 42 Q103 33 121 42 L151 18 Q157 13 157 23 L155 76 Q171 99 146 122 Q123 147 100 141 Q77 148 53 122 Q30 100 46 75Z" />
    <path className="fur-dark" d="M53 61 L53 29 L74 49Z M129 50 L148 28 L148 62Z" />
    <path className="fur-light" d="M48 82 Q71 72 98 102 Q123 73 154 82 Q163 105 143 123 Q99 161 59 122 Q42 106 48 82Z" />
    <path className="paper" d="M44 91 Q62 93 98 111 Q130 92 158 90 Q152 124 101 140 Q52 125 44 91Z" />
    <path className="ink" d="M93 105 Q101 101 108 105 Q107 115 101 116 Q95 115 93 105Z" />
    {mood === "sad" ? <path className="glasses" d="M91 126 Q101 117 111 126" /> : <path className="glasses" d="M90 119 Q101 130 113 119" />}
    <rect className="glasses" x="56" y="73" width="37" height="28" rx="12" /><rect className="glasses" x="108" y="73" width="37" height="28" rx="12" /><path className="glasses" d="M93 84 Q100 80 108 84 M48 80 L56 81 M145 81 L153 79" />
    {mood === "focused" ? <><circle className="ink" cx="77" cy="87" r="4" /><circle className="ink" cx="124" cy="87" r="4" /></> : <path className="glasses" d="M68 88 Q74 80 81 88 M117 88 Q123 80 131 88" />}
    {reading ? <><path className="book" d="M58 140 Q82 130 102 142 Q121 130 146 140 L141 172 Q119 166 102 179 Q82 166 61 172Z" /><path className="book-light" d="M101 144 L102 174" /><path className="fur" d="M55 142 Q42 144 51 159 L65 158 L65 144Z M144 140 Q159 143 150 157 L139 157Z" /></> : <><ellipse className="fur" cx="67" cy="145" rx="10" ry="18" transform="rotate(-25 67 145)" /><ellipse className="fur" cx="136" cy="140" rx="10" ry="20" transform={`rotate(${mood === "encouraging" ? -40 : 25} 136 140)`} /></>}
    <ellipse className="fur-dark" cx="79" cy="183" rx="15" ry="5" /><ellipse className="fur-dark" cx="124" cy="183" rx="15" ry="5" />
    {reading && <><path className="spark" d="M24 65 L27 73 L35 76 L27 79 L24 87 L21 79 L13 76 L21 73Z" /><path className="spark" d="M173 40 L176 47 L183 50 L176 53 L173 60 L170 53 L163 50 L170 47Z" /><circle className="book" cx="174" cy="91" r="3" /></>}
  </motion.svg>;
}