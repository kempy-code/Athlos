// =====================================
// ATHLOS CHIP RENDERER
// public/js/renders/chips.js
// =====================================



export function renderChips(

    container,

    question,

    selectAnswer

){



    let selected = [];





    // Restore previous answer if it exists

    if(
        Array.isArray(question.value)
    ){

        selected =
            question.value;

    }







    question.options.forEach(option=>{



        const chip =
            document.createElement("button");



        chip.className =
            "chip-option";



        chip.textContent =
            option;





        chip.addEventListener(

            "click",

            ()=>{





                // Multiple selection

                if(
                    question.multiple
                ){



                    if(
                        selected.includes(option)
                    ){


                        selected =
                            selected.filter(
                                item =>
                                item !== option
                            );


                        chip.classList.remove(
                            "selected"
                        );


                    }

                    else{


                        selected.push(
                            option
                        );


                        chip.classList.add(
                            "selected"
                        );


                    }





                    selectAnswer(
                        selected
                    );



                }





                // Single selection

                else{



                    document

                    .querySelectorAll(
                        ".chip-option"
                    )

                    .forEach(button=>{


                        button.classList.remove(
                            "selected"
                        );


                    });





                    chip.classList.add(
                        "selected"
                    );





                    selectAnswer(
                        option
                    );



                }




            }

        );





        container.appendChild(
            chip
        );



    });



}