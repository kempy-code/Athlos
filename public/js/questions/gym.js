// =====================================
// ATHLOS GYM MODULE
// public/js/questions/gym.js
// =====================================


export default [

    {
        id:"gym_goal",

        title:"What is your main gym goal?",

        description:
        "Athlos will design your training around this priority.",

        type:"chips",

        options:[

            "Build Muscle",

            "Increase Strength",

            "Fat Loss",

            "Athletic Performance",

            "General Fitness"

        ],

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Gym"

        }

    },





    {
        id:"lifting_experience",

        title:"How long have you been lifting?",

        type:"chips",

        options:[

            "Never",

            "Less than 3 months",

            "3-12 months",

            "1-3 years",

            "3+ years"

        ],

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Gym"

        }

    },





    {
        id:"lifting_frequency",

        title:"How many gym sessions can you complete each week?",

        type:"slider",

        min:1,

        max:7,

        default:3,

        unit:"sessions/week",

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Gym"

        }

    },





    {
        id:"gym_equipment",

        title:"What equipment do you have access to?",

        description:
        "Select everything available.",

        type:"chips",

        multiple:true,

        options:[

            "Commercial Gym",

            "Home Gym",

            "Barbell",

            "Dumbbells",

            "Machines",

            "Cable Equipment",

            "Bodyweight Only"

        ],

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Gym"

        }

    },





    {
        id:"training_split",

        title:"What training split do you prefer?",

        type:"chips",

        options:[

            "Full Body",

            "Upper / Lower",

            "Push Pull Legs",

            "Body Part Split",

            "No Preference"

        ],

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Gym"

        }

    },





    {
        id:"bench_press",

        title:"What is your current bench press?",

        description:
        "Leave blank if you do not know.",

        type:"text",

        placeholder:
        "Example: 60kg",

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Gym"

        }

    },





    {
        id:"squat",

        title:"What is your current squat?",

        type:"text",

        placeholder:
        "Example: 100kg",

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Gym"

        }

    },





    {
        id:"deadlift",

        title:"What is your current deadlift?",

        type:"text",

        placeholder:
        "Example: 120kg",

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Gym"

        }

    },





    {
        id:"overhead_press",

        title:"What is your overhead press?",

        type:"text",

        placeholder:
        "Example: 40kg",

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Gym"

        }

    },





    {
        id:"pullups",

        title:"How many pull ups can you do?",

        type:"number",

        placeholder:
        "Example: 10",

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Gym"

        }

    },





    {
        id:"muscle_priority",

        title:"Which areas do you want to prioritise?",

        type:"chips",

        multiple:true,

        options:[

            "Chest",

            "Back",

            "Shoulders",

            "Arms",

            "Legs",

            "Core",

            "Overall Balance"

        ],

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Gym"

        }

    },





    {
        id:"gym_style",

        title:"How do you like training?",

        type:"chips",

        options:[

            "Heavy Strength",

            "Bodybuilding Style",

            "Athletic Training",

            "Balanced"

        ],

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Gym"

        }

    },





    {
        id:"gym_exercise_preferences",

        title:"Any exercises you especially enjoy or dislike?",

        type:"text",

        multiline:true,

        placeholder:
        "Example: Love bench press, dislike squats",

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Gym"

        }

    }

];