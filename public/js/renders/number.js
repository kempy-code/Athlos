// =====================================
// ATHLOS NUMBER INPUT RENDERER
// public/js/renders/number.js
// =====================================


export function renderNumber(

    container,

    question,

    selectAnswer

){


    const wrapper =
        document.createElement("div");


    wrapper.className =
        "number-container";





    const input =
        document.createElement("input");



    input.type =
        "number";



    input.className =
        "athlos-number-input";



    input.placeholder =
        question.placeholder ||
        "Enter a number";





    if(question.min !== undefined){

        input.min =
            question.min;

    }



    if(question.max !== undefined){

        input.max =
            question.max;

    }





    input.addEventListener(

        "input",

        ()=>{


            const value =
                input.value;



            if(value === ""){


                selectAnswer(
                    null
                );


                return;

            }




            selectAnswer(
                Number(value)
            );


        }

    );






    wrapper.appendChild(
        input
    );



    container.appendChild(
        wrapper
    );


}