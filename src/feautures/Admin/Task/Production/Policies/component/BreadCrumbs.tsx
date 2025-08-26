import { Breadcrumbs } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

export default function BreadCrumbs({ list }: { list: Array<any> }) {
  const location = useLocation();

  function handleClick(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    event.preventDefault();
  }
  return (
    <div role="presentation" onClick={handleClick}>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
      >
        {list.map((item, idx) => {
          return (
            <Link
              key={idx}
              to={item.link}
              style={{
                textDecoration: "none",
                color: item.link === location.pathname ? "#f97316" : "black",
              }}
            >
              {item.text}
            </Link>
          );
        })}
      </Breadcrumbs>
    </div>
  );
}
