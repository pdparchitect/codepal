import Head from 'next/head';
import Hero from '../components/Hero';
import Footer from '../components/Footer';

const IndexPage = () => {
  const year = new Date().getFullYear();

  return (
    <>
      <Head>
        <title>Codepal - A Command Line Tool with Chat Interface</title>
      </Head>
      <Hero title="Welcome to Codepal" subTitle="Let's get coding!" />
      <main className="max-w-2xl mx-auto">
        <p>Codepal is a command line tool with a chat interface that helps developers write code, built on top of GPT-3 and ChatGPT.</p>
      </main>
      <Footer />
    </>
  );
};

export default IndexPage;
