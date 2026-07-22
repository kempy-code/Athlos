// =====================================
// ATHLOS QUESTION LOADER
// public/js/questions/index.js
// =====================================



import profile from "./profile.js";

import goals from "./goals.js";

import history from "./history.js";

import lifestyle from "./lifestyle.js";

import health from "./health.js";

import running from "./running.js";

import gym from "./gym.js";

import sport from "./sport.js";

import hybrid from "./hybrid.js";







// =====================================
// CORE QUESTIONS
// Always shown
// =====================================


export const coreQuestions = [

    ...profile,

    ...goals,

    ...history,

    ...lifestyle,

    ...health

];








// =====================================
// TRAINING MODULES
// Loaded dynamically
// =====================================


export const trainingModules = {


    "Running":

        running,


    "Gym":

        gym,


    "Team Sport":

        sport,


    "Hybrid":

        hybrid


};








// =====================================
// GET MODULE
// =====================================


export function getTrainingModule(type){


    return trainingModules[type] || [];


}








// =====================================
// BUILD QUESTION LIST
// =====================================


export function buildQuestions(profileData = {}){


    let questions = [

        ...coreQuestions

    ];




    const trainingType =

        profileData.training_type;





    if(trainingType){


        questions.push(

            ...getTrainingModule(
                trainingType
            )

        );


    }





    return questions;


}








// =====================================
// EXPORT EVERYTHING
// =====================================


export default {


    coreQuestions,

    trainingModules,

    getTrainingModule,

    buildQuestions

};