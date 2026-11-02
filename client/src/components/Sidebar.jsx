import { Flower2, History, LayoutDashboard, Leaf, Plus, Sprout } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard", Icon: LayoutDashboard, end: true },
  { to: "/plants", label: "My Plants", Icon: Flower2 },
  { to: "/plants/new", label: "Add Plant", Icon: Plus },
  { to: "/history", label: "Care History", Icon: History }
];

export default function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="sidebar">
      <NavLink to="/" className="brand">
        <span className="brand-icon"><Sprout size={24} /></span>
        <span>Plant<span className="brand-light">Pal</span><small>CARE REMINDER</small></span>
      </NavLink>
      <div className="side-label">MENU</div>
      <nav className="side-nav" aria-label="Main navigation">
        {links.map(({ to, label, Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-link${isActive && !(label === "My Plants" && pathname === "/plants/new") ? " active" : ""}`}>
            <Icon size={19} strokeWidth={1.9} /><span>{label}</span>
            {label === "Add Plant" && <span className="nav-plus">+</span>}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-note">
        <Leaf size={18} />
        <p>A little care goes a long way.</p>
        <span>Keep growing, one day at a time.</span>
      </div>
      <div className="sidebar-footer">Made for your leafy friends <span>🌿</span></div>
    </aside>
  );
}
