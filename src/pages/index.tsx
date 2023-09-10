import { Meta } from '@/layouts/Meta';

const Index = () => {
  return (
    <div className="flex min-h-screen min-w-full flex-col items-center border border-black">
      <Meta
        title="Next.js Boilerplate Presentation"
        description="Next js Boilerplate is the perfect starter code for your project. Build your React application with the Next.js framework."
      />
      <h1 className="text-2xl font-bold">Next.js Boilerplate</h1>
    </div>
  );
};

export default Index;
