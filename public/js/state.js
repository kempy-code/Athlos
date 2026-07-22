// =====================================
// ATHLOS STATE MANAGEMENT
// public/js/state.js
// =====================================



// =====================================
// DEFAULT STATE
// =====================================


const defaultState = {


    profile:{},


    currentQuestionIndex:0,


    completedQuestions:[],


    totalQuestions:0,


    loading:false,


    started:false,


    finished:false


};







// =====================================
// INTERNAL STATE
// =====================================


let state = {

    ...defaultState,

    profile:{},

    completedQuestions:[]

};








// =====================================
// GET STATE
// =====================================


export function getState(){


    return state;


}








// =====================================
// RESET STATE
// =====================================


export function resetState(){


    state = {

        ...defaultState,

        profile:{},

        completedQuestions:[]

    };


    saveLocal();


}








// =====================================
// SAVE ANSWER
// =====================================


export function saveAnswer(

    id,

    value

){



    state.profile[id] =
        value;



    saveLocal();



}








// =====================================
// REMOVE ANSWER
// =====================================


export function removeAnswer(id){


    delete state.profile[id];


    saveLocal();


}








// =====================================
// COMPLETE QUESTION
// =====================================


export function completeQuestion(id){



    if(

        !state.completedQuestions.includes(id)

    ){


        state.completedQuestions.push(id);


    }



    saveLocal();


}








// =====================================
// QUESTION INDEX
// =====================================


export function setQuestionIndex(index){



    state.currentQuestionIndex =
        index;



    saveLocal();


}








// =====================================
// TOTAL QUESTIONS
// =====================================


export function setTotalQuestions(total){


    state.totalQuestions =
        total;



    saveLocal();


}








// =====================================
// LOADING STATE
// =====================================


export function setLoading(value){


    state.loading =
        value;



    saveLocal();


}








// =====================================
// START / FINISH
// =====================================


export function startQuiz(){


    state.started =
        true;



    saveLocal();


}



export function finishQuiz(){


    state.finished =
        true;



    saveLocal();


}








// =====================================
// LOCAL STORAGE
// =====================================


function saveLocal(){



    localStorage.setItem(

        "athlos_state",

        JSON.stringify(state)

    );


}








export function loadState(){



    const saved =

        localStorage.getItem(
            "athlos_state"
        );





    if(saved){


        state = JSON.parse(saved);


    }




    return state;


}








// =====================================
// PROFILE EXPORT
// =====================================


export function getProfile(){


    return state.profile;


}