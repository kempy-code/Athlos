// =====================================
// ATHLOS QUESTION ENGINE
// public/js/questionEngine.js
// =====================================


import {
    buildQuestions
} from "./questions/index.js";


import {
    getState,
    saveAnswer,
    setQuestionIndex,
    completeQuestion,
    setTotalQuestions
} from "./state.js";





let activeQuestions = [];





// =====================================
// INITIALISE ENGINE
// =====================================


export function initQuestionEngine(){


    refreshQuestions();



    const state =
        getState();



    setQuestionIndex(
        state.currentQuestionIndex || 0
    );



    return activeQuestions;

}








// =====================================
// REBUILD QUESTIONS
// =====================================


export function refreshQuestions(){



    const state =
        getState();





    activeQuestions =
        buildQuestions(
            state.profile
        );





    setTotalQuestions(
        activeQuestions.length
    );





    return activeQuestions;


}








// =====================================
// GET ALL QUESTIONS
// =====================================


export function getQuestions(){


    refreshQuestions();


    return activeQuestions;


}








// =====================================
// GET CURRENT QUESTION
// =====================================


export function getCurrentQuestion(){



    refreshQuestions();




    const state =
        getState();





    return activeQuestions[

        state.currentQuestionIndex

    ] || null;


}








// =====================================
// GET NEXT VISIBLE QUESTION
// =====================================


export function getNextVisibleQuestion(){



    refreshQuestions();




    const state =
        getState();





    let index =
        state.currentQuestionIndex;






    while(

        index < activeQuestions.length

    ){



        const question =
            activeQuestions[index];




        if(
            isQuestionVisible(question)
        ){



            setQuestionIndex(
                index
            );



            return question;


        }





        index++;


    }





    return null;


}








// =====================================
// SAVE ANSWER
// =====================================


export function answerQuestion(

    id,

    value

){



    saveAnswer(

        id,

        value

);





    completeQuestion(

        id

    );





    refreshQuestions();


}








// =====================================
// NEXT QUESTION
// =====================================


export function nextQuestion(){



    const state =
        getState();





    setQuestionIndex(

        state.currentQuestionIndex + 1

    );





    return getNextVisibleQuestion();


}








// =====================================
// CONDITIONS
// =====================================


export function isQuestionVisible(question){



    if(
        !question.condition
    ){

        return true;

    }






    const {

        question:id,

        operator,

        value

    } = question.condition;







    const state =
        getState();





    const answer =
        state.profile[id];








    switch(operator){



        case "equals":


            return answer === value;





        case "not_equals":


            return answer !== value;





        case "contains":


            if(
                Array.isArray(answer)
            ){

                return answer.includes(value);

            }


            return false;





        case "greater_than":


            return Number(answer) > Number(value);





        case "less_than":


            return Number(answer) < Number(value);





        default:


            return true;


    }


}








// =====================================
// VALIDATION
// =====================================


export function validateAnswer(

    question,

    answer

){



    if(!question){

        return false;

    }




    if(
        answer === null ||
        answer === undefined
    ){

        return false;

    }





    if(
        typeof answer === "string"
        &&
        answer.trim() === ""
    ){

        return false;

    }





    if(
        Array.isArray(answer)
        &&
        answer.length === 0
    ){

        return false;

    }





    return true;


}








// =====================================
// PROGRESS
// =====================================


export function getProgress(){



    const state =
        getState();





    const total =
        activeQuestions.length;





    if(total === 0){

        return 0;

    }





    return (

        (
            state.currentQuestionIndex + 1
        )

        /

        total

    ) * 100;


}








// =====================================
// COMPLETE CHECK
// =====================================


export function isComplete(){



    refreshQuestions();




    const state =
        getState();





    return (

        state.currentQuestionIndex >=

        activeQuestions.length

    );


}