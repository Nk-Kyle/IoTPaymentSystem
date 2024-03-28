"use client";

import { useState, useEffect, Fragment, ReactNode } from "react";
import mqttClient from "./mqttListener";

const MQTT_TOPIC_SUCCESS = 'iot/success';
const MQTT_TOPIC_FAILURE = 'iot/failed';

export default function Home(): JSX.Element {
  const [welcomeMessage, setWelcomeMessage] = useState<ReactNode>("Welcome to Payment Merchant - V1");
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    const handleNewMessage = (topic: string, message: Buffer) => {
      const messageString = message.toString();
      const messageParts = messageString.split('\n').map((part, index) => 
        <Fragment key={index}>{part}<br /></Fragment>
      );

      if (topic === MQTT_TOPIC_SUCCESS) {
        setWelcomeMessage(<><span style={{color: 'green'}}>{`Payment Successful: `}<br /></span>{messageParts}</>);
        setStatus("success");
        setTimeout(() => {
          setWelcomeMessage("Welcome to Payment Merchant - V1");
          setStatus("");
        }, 5000);
      } else if (topic === MQTT_TOPIC_FAILURE) {
        setWelcomeMessage(<><span style={{color: 'red'}}>{`Payment Failed: `}<br /></span>{messageParts}</>);
        setStatus("failure");
        setTimeout(() => {
          setWelcomeMessage("Welcome to Payment Merchant - V1");
          setStatus("");
        }, 5000);
      }
    };

    mqttClient.on('message', handleNewMessage);

    return () => {
      mqttClient.off('message', handleNewMessage);
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Payment Merchant - &nbsp;
          <code className="font-mono font-bold">V1</code>
        </p>
      </div>
      <p className="text-4xl font-bold text-center">
        {welcomeMessage}
      </p>
      {status === "success" && <div className="mt-8 flex justify-center">
        <div className="w-10 h-10 bg-green-500 rounded-full animate-bounce delay-1000"></div>
      </div>}
      {status === "failure" && <div className="mt-8 flex justify-center">
        <div className="w-10 h-10 bg-red-500 rounded-full animate-bounce delay-1000"></div>
      </div>}
      {status === "" && <p className="mt-4 text-center text-lg font-bold">
        <span className="animate-pulse">Waiting for payment...</span>
      </p>}
    </main>
  );
}