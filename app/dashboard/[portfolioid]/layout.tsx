export default async function Layout({
  banner,
  dashboard
}: {
  banner: React.ReactNode;
  dashboard: React.ReactNode;
}) {

  return (
    <>
      <div className="flex items-center justify-between mx-auto w-full">
        {banner}
      </div>
      <div className="mx-auto w-full">
        {dashboard}
      </div>
      </>
  );
}
