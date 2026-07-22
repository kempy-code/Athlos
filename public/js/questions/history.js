// =====================================
// ATHLOS TRAINING HISTORY QUESTIONS
// public/js/questions/history.js
// =====================================


export default [

    {
        id:"experience_level",

        title:"How experienced are you with training?",

        description:
        "This helps Athlos decide your starting intensity.",

        type:"chips",

        options:[

            "Complete Beginner",

            "Beginner",

            "Intermediate",

            "Advanced",

            "Competitive Athlete"

        ]

    },





    {
        id:"previous_training",

        title:"What types of training have you done before?",

        description:
        "Select everything that applies.",

        type:"chips",

        multiple:true,

        options:[

            "Running",

            "Gym",

            "Team Sport",

            "Swimming",

            "Cycling",

            "Martial Arts",

            "Other"

        ]

    },





    {
        id:"structured_program",

        title:"Have you followed a structured training program before?",

        type:"toggle",

        options:[

            "Yes",

            "No"

        ]

    },





    {
        id:"previous_program",

        title:"What program did you follow?",

        type:"text",

        placeholder:
        "Example: Push/Pull/Legs, marathon plan, school training",

        condition:{

            question:"structured_program",

            operator:"equals",

            value:"Yes"

        }

    },





    {
        id:"program_duration",

        title:"How long did you follow that program?",

        type:"chips",

        options:[

            "Less than 1 month",

            "1-3 months",

            "3-6 months",

            "6+ months"

        ],

        condition:{

            question:"structured_program",

            operator:"equals",

            value:"Yes"

        }

    },





    {
        id:"training_success",

        title:"What worked well in your previous training?",

        description:
        "This helps Athlos avoid repeating mistakes.",

        type:"text",

        multiline:true,

        placeholder:
        "What did you enjoy or improve from?"

        ,

        condition:{

            question:"structured_program",

            operator:"equals",

            value:"Yes"

        }

    },





    {
        id:"training_failure",

        title:"What did not work well?",

        type:"text",

        multiline:true,

        placeholder:
        "What would you change?"

        ,

        condition:{

            question:"structured_program",

            operator:"equals",

            value:"Yes"

        }

    }

];