// =====================================
// ATHLOS CARD RENDERER
// public/js/renders/card.js
// =====================================


export function renderCard(

    container,

    question,

    selectAnswer

){


    const wrapper =
        document.createElement("div");


    wrapper.className =
        "cards-container";






    question.options.forEach(option=>{



        const card =
            document.createElement("button");



        card.className =
            "athlos-card";



        card.type =
            "button";



        card.innerHTML = `

            <span class="card-title">
                ${option}
            </span>

        `;







        card.addEventListener(

            "click",

            ()=>{



                document

                .querySelectorAll(
                    ".athlos-card"
                )

                .forEach(item=>{


                    item.classList.remove(
                        "selected"
                    );


                });







                card.classList.add(
                    "selected"
                );





                selectAnswer(
                    option
                );



            }

        );







        wrapper.appendChild(
            card
        );



    });






    container.appendChild(
        wrapper
    );


}