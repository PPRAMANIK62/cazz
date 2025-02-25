"use client";
import { Button } from "@/components/ui/button";
import { db } from "@/utils/db/dbConfig";
import { chatSession } from "@/utils/db/gemini-model";
import { UserAnswer } from "@/utils/db/schema";
import { useUser } from "@clerk/nextjs";
import { Mic, StopCircle } from "lucide-react";
import moment from "moment";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useVoiceToText } from "react-speakup";
import Webcam from "react-webcam";
import { toast } from "sonner";

export default function RecordAnswerSection({
  mockInterviewQuestion,
  activeQuestionIndex,
  interviewData,
}) {
  const [userAnswer, setUserAnswer] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  // const {
  //   isRecording,
  //   results,
  //   startSpeechToText,
  //   stopSpeechToText,
  //   setResults,
  // } = useSpeechToText({
  //   continuous: true,
  //   useLegacyResults: false,
  // });
  const { startListening, stopListening, transcript } = useVoiceToText({
    continuous: true,
    lang: "en-US",
  });

  // console.log(isRecording)

  // useEffect(() => {
  //   results?.map((result) => {
  //     if (typeof result === "string") {
  //       return setUserAnswer((prevAns) => prevAns + result);
  //     } else {
  //       return setUserAnswer((prevAns) => prevAns + result.transcript);
  //     }
  //   });
  // }, [results]);

  useEffect(() => {
    if (!isRecording && userAnswer?.length > 10) {
      UpdateUserAnswer();
    }
  }, [isRecording, transcript]);

  const StartStopRecording = async () => {
    if (isRecording) {
      setUserAnswer(transcript);
      stopListening();
      setIsRecording(false);
    } else {
      startListening();
      setIsRecording(true);
    }
  };

  const UpdateUserAnswer = async () => {
    setLoading(true);
    const feedbackPrompt =
      "Question:" +
      mockInterviewQuestion[activeQuestionIndex]?.question +
      ", User Answer:" +
      userAnswer +
      ",Depends on question and user answer for give interview question " +
      " please give us rating for answer and feedback as area of improvmenet if any " +
      "in just 3 to 5 lines to improve it in JSON format with rating field and feedback field";

    const result = await chatSession.sendMessage(feedbackPrompt);
    const mockJsonResp = result.response
      .text()
      .replace("```json", "")
      .replace("```", "");
    const JsonFeedbackResp = JSON.parse(mockJsonResp);
    const resp = await db.insert(UserAnswer).values({
      mockIdRef: interviewData?.mockId,
      question: mockInterviewQuestion[activeQuestionIndex]?.question,
      correctAns: mockInterviewQuestion[activeQuestionIndex]?.answer,
      userAns: userAnswer,
      feedback: JsonFeedbackResp?.feedback,
      rating: JsonFeedbackResp?.rating,
      userEmail: user?.primaryEmailAddress?.emailAddress,
      createdAt: moment().format("DD-MM-yyyy"),
    });

    if (resp) {
      toast("User Answer recorded successfully");
      setUserAnswer("");
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center flex-col">
      <div className="flex flex-col justify-center items-center bg-black rounded-lg p-5">
        <Image
          src={"/logo-white-256x256.png"}
          width={200}
          height={200}
          className="absolute"
          alt={""}
        />
        <Webcam
          mirrored={true}
          style={{
            height: 300,
            width: 500,
            zIndex: 10,
          }}
        />
      </div>
      <Button
        disabled={loading}
        variant="outline"
        className="my-10"
        onClick={StartStopRecording}
      >
        {isRecording ? (
          <h2 className="text-red-600 animate-pulse flex gap-2 items-center">
            <StopCircle />
            Stop Recording
          </h2>
        ) : (
          <h2 className="text-primary flex gap-2 items-center">
            <Mic /> Record Answer
          </h2>
        )}
      </Button>
      <p>{transcript}</p>
    </div>
  );
}
