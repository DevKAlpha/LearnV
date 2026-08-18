import { NavLink } from "react-router-dom";

const items = [
  { to: "/", symbol: "⌂", label: "Inicio", end: true },
  { to: "/gks", symbol: "◎", label: "Beca" },
  { to: "/study", symbol: "文", label: "Estudiar" },
  { to: "/checklist", symbol: "✓", label: "Documentos" },
  { to: "/profile", symbol: "☺", label: "Perfil" },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => `nav-item${isActive ? " nav-item--active" : ""}`}
        >
          <span className="nav-symbol" aria-hidden="true">{item.symbol}</span>
          <span className="nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
