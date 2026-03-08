export function Ribbon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="46" height="137" fill="none" {...props}>
      <path fill="url(#a)" d="M45.667 106.107h-1.7549L22.833 137 1.75488 106.107H0V0h45.667z" />
      <defs>
        <linearGradient id="a" x1="1.1e-7" x2="45.667" y1="49.0245" y2="49.0245" gradientUnits="userSpaceOnUse">
          <stop stop-color="#ad7581" />
          <stop offset="1" stop-color="#834856" />
        </linearGradient>
      </defs>
    </svg>
  );
}
