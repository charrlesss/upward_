
import { Helmet } from "react-helmet";

const PageHelmet = ({ title = '' }: { title: string }) => {
    const imgUrl = process.env.REACT_APP_IMAGE_URL;
    return (
        <Helmet>
            <title>{title}</title>
            <link rel="icon" type="image/png" href={`${imgUrl}/logo.png`} />
        </Helmet>
    );
};

export default PageHelmet;