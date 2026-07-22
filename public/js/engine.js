// =====================================
// ATHLOS APP ENGINE
// public/js/engine.js
// =====================================


import buildQuestions, {
    getTrainingModule
} from "./questions/index.js";


import {
    startQuestionEngine
} from "./questionEngine.js";


import {
    getProfile
} from "./state.js";


import {
    showComplete
} from "./ui.js";




// =====================================
// STATE
// =====================================


let questionList = [];







// =====================================
// INITIALISE
// =====================================


function initAthlos(){


    questionList =
        buildQuestions();



    startQuestionEngine(
        questionList
    );


}







// =====================================
// TRAINING ROUTER
// =====================================


function addTrainingModule(type){


    const module =
        getTrainingModule(
            type
        );



    if(
        module.length === 0
    ){

        return;

    }



    questionList.push(
        ...module
    );


}







// =====================================
// LISTEN FOR ANSWERS
// =====================================


document.addEventListener(

    "athlosAnswer",

    event=>{


        const {

            id,

            value

        } =
        event.detail;



        if(
            id === "training_type"
        ){


            addTrainingModule(
                value
            );


        }



    }

);








// =====================================
// FINISH ONBOARDING
// =====================================


document.addEventListener(

    "athlosComplete",

    event=>{


        const profile =
            event.detail;



        console.log(
            "Athlos Profile:",
            profile
        );



        showComplete();



    }

);








// =====================================
// START
// =====================================


initAthlos();