
import { Helmet } from "react-helmet";

const PageHelmet = ({ title = '' }: { title: string }) => {
    const imgUrl = process.env.REACT_APP_IMAGE_URL;
    const department = process.env.REACT_APP_DEPARTMENT
    return (
        <Helmet>
            <title>{`${department} - ${title}`}</title>
            <link rel="icon" type="image/png" href={`${imgUrl}/logo.png`} />
        </Helmet>
    );
};

export default PageHelmet;