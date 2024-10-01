import { Breadcrumbs } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import useUrlParams from "../../../../../../hooks/useUrlParams";

export default function BreadCrumbs({ list }: { list: Array<any> }) {
  const location = useLocation();
  const { searchParams } = useUrlParams();

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
              to={
                item.link +
                `?drawer=${searchParams.get(
                  "drawer"
                )}&pageSize=${searchParams.get("pageSize")}`
              }
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
