/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');

const STREAMS = [
  {
    "locale": "English",
    "token": "stream-12",
    "url": 'https://ice.radiomv.co/english.mp3',
    "metadata" : {
      "title": "English Stream",
      "subtitle": "This is the English stream of RadioMv"
    }
  },
  {
    "locale": "Russian",
    "token": "stream-13",
    "url": 'https://ice.radiomv.co/russian.mp3',
    "metadata": {
      "title": "Russian Stream",
      "subtitle": "This is the Russian stream of RadioMv"
    }
  },
  {
    "locale": "Slavic",
    "token": "stream-13",
    "url": 'https://ice.radiomv.co:8443/russian.mp3',
    "metadata": {
      "title": "Slavic Stream",
      "subtitle": "This is the Slavic stream of RadioMv"
    }
  },
  {
    "locale": "Russian Music",
    "token": "stream-14",
    "url": 'https://ice.radiomv.co:8443/russian_music.mp3',
    "metadata": {
      "title": "Russian Music Only Stream",
      "subtitle": "This is the Russian music only stream of RadioMv"
    }
  },
  {
    "locale": "Ukrainian",
    "token": "stream-15",
    "url": 'https://ice.radiomv.co:8443/ukrainian.mp3',
    "metadata": {
      "title": "Ukrainian Stream",
      "subtitle": "This is the Ukrain stream of RadioMv"
    }
  },
  {
    "locale": "German",
    "token": "stream-16",
    "url": 'https://ice.radiomv.co/german.mp3',
    "metadata": {
      "title": "German Stream",
      "subtitle": "This is the German stream of RadioMv"
    }
  },
  {
    "locale": "Spanish",
    "token": "stream-17",
    "url": 'https://ice.radiomv.co/spanish.mp3',
    "metadata": {
      "title": "Spanish Stream",
      "subtitle": "This is the Spanish stream of RadioMv"
    }
  }
];

const PlayDefaultRadioMvIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  async handle(handlerInput) {

    const responseBuilder = handlerInput.responseBuilder;

    let speechText = 'Welcome to RadioMv. Which stream do you want to listen?';
    let repromptText = 'You can also say, stream list, to know what are the available streams are. Which stream do you want to listen to?';

    return responseBuilder
      .speak(speechText)
      .reprompt(repromptText)
      .getResponse();
  },
};

const PlayRadioMvRussianMusicIntentHandler = {
  canHandle(handlerInput) {
    return (handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && handlerInput.requestEnvelope.request.intent.name === 'PlayRadioMvRussianMusicIntent');
  },
  async handle(handlerInput) {
    var stream = STREAMS.find(obj => {
      return obj.locale === 'Russian Music'
    });

    let speak = 'Ok. Please wait while we connect you to our Russian music stream.';

    handlerInput.responseBuilder
      .speak(speak)
      .addAudioPlayerPlayDirective('REPLACE_ALL', stream.url, stream.token, 0, null, stream.metadata);

    return handlerInput.responseBuilder
      .getResponse();
  },
};

const StreamListIntentHandler = {
  canHandle(handlerInput) {
    return (handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'StreamListIntent');
  },
  async handle(handlerInput) {
    const responseBuilder = handlerInput.responseBuilder;

    let availableStreams = "";
    let i = 0;
    STREAMS.forEach(obj => {
      if (i++ >= (STREAMS.length - 1)) {
        availableStreams = availableStreams + " and " + obj.metadata.title + ".";
      } else {
        availableStreams = availableStreams + ", " + obj.metadata.title;
      }
    });

    let repromptText = 'At which language do you want to stream to?';

    return responseBuilder
      .speak('RadioMv available streams are' + availableStreams + ' Which stream do you want to listen to?')
      .reprompt(repromptText)
      .getResponse();
  },
};

const InProgressPlayRadioMvIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      request.intent.name === 'PlayRadioMvIntent' &&
      request.dialogState !== 'COMPLETED';
  },
  handle(handlerInput) {
    const currentIntent = handlerInput.requestEnvelope.request.intent;
    return handlerInput.responseBuilder
      .addDelegateDirective(currentIntent)
      .getResponse();
  },
};

const PlayRadioMvIntentHandler = {
  canHandle(handlerInput) {
    return (handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'PlayRadioMvIntent') ||
      (handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.ResumeIntent');
  },
  async handle(handlerInput) {

    let locale = handlerInput.requestEnvelope.request.intent.slots.locale.value;

    if (handlerInput.requestEnvelope.request.intent.name === 'PlayRadioMvRussianMusicIntent') {
      locale = "Russian Music";
    }

    let speak = '';

    var stream = STREAMS.find(obj => {
      return obj.locale === locale
    });

    if (stream == undefined) {
      handlerInput.requestEnvelope.request.dialogState = 'IN_PROGRESS';

      speak = 'Sorry. RadioMv doesn\'t support this language yet. Please select another or say, stream list, to know the available streams';

      let repromptText = 'At which language do you want to stream to?';

      return handlerInput.responseBuilder
        .speak(speak)
        .reprompt(repromptText)
        .getResponse();
      //stream = STREAMS[0];
    } else {
      speak = 'Ok. Please wait while we connect you to our ' + stream.locale + ' stream.';
    }

    handlerInput.responseBuilder
      .speak(speak)
      .addAudioPlayerPlayDirective('REPLACE_ALL', stream.url, stream.token, 0, null, stream.metadata);

    return handlerInput.responseBuilder
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'This skill just plays an audio stream when it is started. It does not have any additional functionality.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.PauseIntent');
  },
  handle(handlerInput) {

    handlerInput.responseBuilder
      .addAudioPlayerClearQueueDirective('CLEAR_ALL')
      .addAudioPlayerStopDirective();

    return handlerInput.responseBuilder
      .getResponse();
  },
};

const PlaybackStoppedIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'AudioPlayer.PlaybackStopped';
  },
  handle(handlerInput) {
    //should save details so play can be resumed.
    return true;
  },
};

//AudioPlayer.PlaybackStarted
const PlaybackStartedIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'AudioPlayer.PlaybackStarted';
  },
  handle(handlerInput) {
    handlerInput.responseBuilder
      .addAudioPlayerClearQueueDirective('CLEAR_ENQUEUED');

    return handlerInput.responseBuilder
      .getResponse();
  },
};

//AudioPlayer.PlaybackStarted
const PlaybackNearlyFinishedHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'AudioPlayer.PlaybackNearlyFinished';
  },
  handle(handlerInput) {
    console.log('Stream Finished');
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder
      .getResponse();
  },
};

//System.ExceptionEncountered
const ExceptionEncounteredRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'System.ExceptionEncountered';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return true;
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    console.log(`REQUEST: ${handlerInput.requestEnvelope.request.type}`);

    return handlerInput.responseBuilder
      .addAudioPlayerClearQueueDirective('CLEAR_ALL')
      .addAudioPlayerStopDirective()
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    PlayDefaultRadioMvIntentHandler,
    PlayRadioMvIntentHandler,
    PlaybackStartedIntentHandler,
    CancelAndStopIntentHandler,
    PlaybackStoppedIntentHandler,
    HelpIntentHandler,
    ExceptionEncounteredRequestHandler,
    SessionEndedRequestHandler,
    PlaybackNearlyFinishedHandler,
    InProgressPlayRadioMvIntentHandler,
    StreamListIntentHandler,
    PlayRadioMvRussianMusicIntentHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();