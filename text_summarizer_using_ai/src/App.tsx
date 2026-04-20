import {useState} from "react"
import { IoSparkles } from 'react-icons/io5';
import { HiCheck, HiClipboard, HiExclamationCircle } from 'react-icons/hi';
import { GoogleGenAI } from '@google/genai';


const App = () => {
  const [text,setText] = useState<string>("  ");
  const [summary,setSummary] = useState<string>("hello world") ;
  const [loading,setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied,setCopied] = useState<boolean>(false)

  const countWords = (str: string) => {
    // trim() — remove leading/trailing whitespace so extra spaces at the ends don’t affect the count.
    // split(/\s+/) — split on one or more spaces/tabs/newlines so multiple spaces count as one separator.
    // filter((word) => word.length > 0) — drop empty strings (e.g. from edge cases) so we don’t count “ghost” words.
    // .length — number of segments left after trim → split → filter = word count.
    return str.trim().split(/\s+/).filter((word: string) => word.length > 0).length;
  };

  const countSentences = (str: string) => {
    // trim() — strip leading/trailing whitespace so stray newlines/spaces don’t create fake empty “sentences”.
    // split(/[.!?]+/) — break the string wherever ., !, or ? appear (one or more); those marks are sentence boundaries.
    // filter(s => s.trim().length > 0) — remove empty segments (e.g. "Hi!!" can produce blanks between delimiters).
    // .length — how many non-empty chunks remain ≈ sentence count (rough heuristic; misses abbreviations like "Dr.").
    return str
      .trim()
      .split(/[.!?]+/)
      .filter((sentences) => sentences.trim().length > 0).length;
  };

  const pasteText = async () => {
    try{
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);

    }catch(error){
      setError(error instanceof Error ? error.message : "Failed to paste from clipboard") ;
      console.error("Failed to paste :" , error);
      
    }
  }

  const summarizeText = async () => {
    // input validation : 
    if(!text.trim()){
      setError("Please enter some text to summarize");
      return ;
    }

    if (text.trim().length < 50) {
      setError("Too short — please enter at least 50 characters.");
      return;
    }

    setLoading(true);
    setError(null) ;
    setSummary("");

    try{
      // coneect to google ai server 
      const ai = new GoogleGenAI({apiKey : import.meta.env.VITE_GEMINI_API_KEY});

      // send request to the model : 
      const response = await ai.models.generateContent({
        model : "gemini-2.5-flash" ,
        contents : "provide a consice summary of the following text : \n\n" + text ,
      })

      // return the response 
      const responseText = response.text;
      console.log("AI response : " , responseText);
      setSummary(responseText)

    } catch (error) {
      console.error("Summarization failed:", error);
      setError(
        error instanceof Error ? error.message : "An error occurred during summarization"
      );
    } finally {
      setLoading(false);
    }
  }

  const copyToClipboard = async () => {
    try{
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false),3000)
    }catch(error){
      console.error("Failed to copy")
      setError(error instanceof Error ? error.message : "Failed to copy summary")
    }
  }

  const clearAll = () => {
    setText("");
    setSummary("");
    setError(null);
    setCopied(false);
  }

  return (
    <>
    <div 
      data-theme={`light`}
      className={`min-h-screen bg-linear-to-br from-purple-200 via-blue-100 to-pink-200`}
      >
      <div className='container mx-auto px-4 py-12'>

        <div className='text-center mb-12 '>
          <h1 className='bg-clip-text text-4xl font-bold mb-4 bg-linear-to-r from-purple-600 to-blue-600 text-transparent flex item-center justify-center gap-3 md:text-5xl lg:text-6xl'> 
            <IoSparkles className='text-purple-500'/> AI Text Summarizer
          </h1>
          <p className='text-xl text-base-content/70 font-medium'>Powered by Google Gemini AI</p>
        </div>

        <div className='card bg-base-100 shadow-2xl max-w-5xl mx-auto'>
          <div className='card-body p-7 '>

            <div className='mb-6'>
              <div className="flex flex-col sm:flex-row items-start sm:items-center items-center justify-between">
                  <label className='text-lg font-semibold'>
                    Enter Your Text Here
                </label>

                <div className='flex items-center gap-3 p-4 '>

                  <div className='tooltip' data-tip={`${text.length} characters`}>
                    <div className="badge badge-lg badge-ghost gap-2">
                      {countWords(text)} words * {countSentences(text)} sentences
                    </div>
                  </div>

                  <button className='btn btn-sm btn-primary gap-2' onClick={pasteText}> 
                    <HiClipboard className='w-4 h-4'/> Paste 
                  </button>

                </div>
              </div>

              <textarea 
              onChange={(e) => setText(e.target.value)} 
              value={text} 
              className='textarea textarea-primary w-full h-60 text-base ' 
              placeholder='Example text'>

              </textarea>
            </div>

            {error && (
              <div className='alert alert-error mb-6'>
                <HiExclamationCircle className='w-6 h-6 mr-2' />
                <span>{error}</span>
              </div>
            )}

              {/* have 2 action buttons*/}
            <div className='flex gap-3 justify-end mb-6'>
                <button disabled={loading} onClick={clearAll} className='btn btn-secondary ' >Clear</button>
                <button disabled={loading} onClick={summarizeText} className='btn btn-primary '>
                  {loading ? (
                    <> 
                    <span className='loading loading-spinner'></span>
                    Summarizing
                    </>
                   
                  ): (
                    <div> Summary </div>
                  )}
                </button>
            </div>
            {summary && (<div className='divider'></div>)}
            {summary && (
              <div className='flex items-center justify-between' >
                <div>
                  <h2 className='font-bold text-2xl ml-3' >Summary</h2>
                  <div className='tooltip' data-tip={`${summary.length} characters`} >
                    <div className="badge badge-lg badge-ghost gap-2">
                      {countWords(summary)} words * {countSentences(summary)} sentences
                    </div>
                  </div>
                </div>

                <button className='btn btn-success gap-2' onClick={copyToClipboard} >
                  {copied ? (
                    <>
                    <HiCheck className='w-6 h-6' /> Copied !
                    </>
                  ):(
                    <>
                    <HiClipboard className='w-6 h-6' /> Copy
                    </>
                  )}
                </button>

              </div>
            )}
            {summary && (
              <div className='mt-4 rounded-xl border border-base-300 bg-base-200/50 p-5'>
                <p className='whitespace-pre-wrap leading-7 text-base-content/90'>
                  {summary}
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>

    
    </>
  )
}

export default App