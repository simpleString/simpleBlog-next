import ContentLoader from "react-content-loader";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HeadBodyGrid = (props: any) => (
  <ContentLoader
    uniqueKey="post"
    speed={2}
    viewBox="0 0 400 460"
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
    {...props}
  >
    <rect x="15" y="15" rx="4" ry="4" width="350" height="25" />
    <rect x="15" y="50" rx="2" ry="2" width="350" height="250" />
    <rect x="508" y="535" rx="2" ry="2" width="170" height="20" />
    <rect x="581" y="526" rx="2" ry="2" width="170" height="20" />
  </ContentLoader>
);

export default HeadBodyGrid;
