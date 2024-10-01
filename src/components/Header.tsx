import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header
      style={{
        position: "sticky",
        borderBottom: "1px solid red",
        display: "flex",
      }}
    >
      {/* <img /> */}
      <ul>
        <li>
          <Link to={"/"}>Landing Page</Link>
        </li>
        <li>
          <Link to={"/dashboard"}>Dashboard</Link>
        </li>
      </ul>
    </header>
  );
}
