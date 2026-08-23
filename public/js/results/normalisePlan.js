// =====================================
// ATHLOS PLAN NORMALISER
// public/js/results/normalisePlan.js
// =====================================

export function normalisePlan(rawPlan) {

    const raw = isPlainObject(rawPlan?.plan)
        ? rawPlan.plan
        : (isPlainObject(rawPlan) ? rawPlan : {});

    const sourceWorkouts = getSourceWorkouts(raw);

    const workouts = sourceWorkouts
        .map((session, index) => normaliseWorkout(session, index))
        .filter(Boolean);

    const exercises = workouts.flatMap(workout => workout.exercises);
    const nutritionSource = isPlainObject(raw.nutrition) ? raw.nutrition : {};
    const recoverySource = isPlainObject(raw.recovery) ? raw.recovery : {};
    const progression = isPlainObject(raw.progression) ? raw.progression : {};

    const metadata = {
        programName: firstValue(
            raw.program_name,
            raw.dashboard?.title,
            raw.program_overview?.name,
            raw.program_overview?.program_name,
            "Athlos Training Plan"
        ),
        duration: firstValue(
            raw.program_duration,
            weeksLabel(raw.program_overview?.duration_weeks),
            raw.program_overview?.duration,
            "-"
        ),
        trainingDays: firstValue(
            raw.training_days,
            raw.program_overview?.weekly_training_days,
            raw.available_days?.length,
            workouts.length,
            0
        ),
        sessionLength: firstValue(
            raw.session_length,
            raw.program_overview?.session_duration,
            "-"
        )
    };

    const nutrition = {
        ...nutritionSource,
        calories: firstValue(
            nutritionSource.calories,
            nutritionSource.calorie_target,
            nutritionSource.daily_calories,
            "-"
        ),
        protein: firstValue(nutritionSource.protein, nutritionSource.protein_target, "-"),
        carbohydrates: firstValue(
            nutritionSource.carbohydrates,
            nutritionSource.carbs,
            nutritionSource.carbohydrate_target,
            "-"
        ),
        fat: firstValue(nutritionSource.fat, nutritionSource.fats, "-"),
        hydration: firstValue(nutritionSource.hydration, nutritionSource.hydration_target, "-"),
        notes: firstValue(nutritionSource.notes, nutritionSource.coach_notes, nutritionSource.summary, ""),
        meals: normaliseMeals(nutritionSource),
        guidance: firstArray(
            nutritionSource.guidance,
            nutritionSource.daily_structure,
            nutritionSource.recommendations,
            nutritionSource.meal_ideas,
            []
        )
    };

    const recovery = {
        ...recoverySource,
        sleep: firstValue(recoverySource.sleep, recoverySource.sleep_target, "-"),
        mobility: firstValue(
            recoverySource.mobility,
            recoverySource.mobility_target,
            recoverySource.weekly_recovery,
            recoverySource.daily_actions,
            "-"
        ),
        restDays: firstValue(recoverySource.rest_days, recoverySource.restDays, "-"),
        injuryManagement: firstValue(recoverySource.injury_management, recoverySource.injuryManagement, "-"),
        tips: firstArray(
            recoverySource.tips,
            recoverySource.weekly_recovery,
            recoverySource.daily_actions,
            []
        ),
        recovery_tips: firstArray(
            recoverySource.recovery_tips,
            recoverySource.tips,
            recoverySource.weekly_recovery,
            recoverySource.daily_actions,
            []
        )
    };

    const milestones = firstArray(
        progression.milestones,
        progression.targets,
        []
    );

    return {
        metadata,
        athlete: isPlainObject(raw.athlete_summary) ? raw.athlete_summary : {},
        workouts,
        calendar: workouts.map(workout => ({ day: workout.day, workout })),
        exercises,
        nutrition,
        recovery,
        achievements: normaliseAchievements(raw.achievements),
        milestones,
        analytics: {
            volume: firstArray(progression.weekly_training_load, progression.training_load, []),
            intensity: firstArray(
                progression.weekly_intensity,
                progression.training_intensity,
                []
            ),
            milestones
        }
    };
}

function getSourceWorkouts(raw) {

    if (Array.isArray(raw.workouts)) {
        return raw.workouts;
    }

    if (Array.isArray(raw.weekly_workouts)) {
        return raw.weekly_workouts.flatMap(week => {
            if (Array.isArray(week?.sessions)) {
                return week.sessions.map(session => ({
                    ...session,
                    week: session.week ?? week.week,
                    type: session.type ?? week.theme,
                    purpose: session.purpose ?? week.theme
                }));
            }

            return week == null ? [] : [week];
        });
    }

    return [];
}

function normaliseWorkout(session, index) {

    if (typeof session === "string") {
        return {
            day: `Session ${index + 1}`,
            name: session,
            type: "Training",
            purpose: "",
            duration: "-",
            warmup: [],
            exercises: [],
            cooldown: [],
            progression: ""
        };
    }

    if (!isPlainObject(session)) {
        return null;
    }

    return {
        day: firstValue(session.day, session.training_day, session.weekday, `Session ${index + 1}`),
        name: firstValue(session.session_name, session.name, session.title, session.session, "Training Session"),
        type: firstValue(session.type, session.session_type, session.focus, "Training"),
        purpose: firstValue(session.purpose, session.goal, session.objective, session.focus, ""),
        duration: durationLabel(session),
        warmup: firstArray(session.warmup, session.warm_up, session.warmUp, []),
        exercises: extractExercises(session),
        cooldown: firstArray(
            session.cooldown,
            session.cool_down,
            session.coolDown,
            session.mobility_finisher,
            []
        ),
        progression: firstValue(session.progression, session.readiness_check, session.recovery_version, "")
    };
}

function extractExercises(session) {

    const source = firstArray(
        session.exercises,
        session.main_workout,
        session.mainWorkout,
        session.workout,
        session.blocks,
        []
    );

    return source.flatMap(item => normaliseExerciseItem(item));
}

function normaliseExerciseItem(item, category = "Training") {

    if (typeof item === "string" || typeof item === "number") {
        return [makeExercise({ name: String(item), category })];
    }

    if (!isPlainObject(item)) {
        return [];
    }

    if (Array.isArray(item.exercises)) {
        return item.exercises.flatMap(exercise =>
            normaliseExerciseItem(exercise, firstValue(item.block, item.category, item.name, category))
        );
    }

    return [makeExercise({
        name: firstValue(item.exercise, item.name, item.title, item.movement, "Exercise"),
        category: firstValue(item.category, item.block, category),
        equipment: firstValue(item.equipment, ""),
        muscles: firstValue(item.muscles, item.muscle_group, ""),
        sets: firstValue(item.sets, "-"),
        reps: firstValue(item.reps, item.repetitions, item.duration, item.time, "-"),
        rest: firstValue(item.rest, restLabel(item.rest_seconds), item.rest_time, "-"),
        instructions: firstValue(item.instructions, item.coaching_notes, item.notes, item.intensity, "")
    })];
}

function makeExercise(exercise) {
    return {
        name: exercise.name || "Exercise",
        category: exercise.category || "Training",
        equipment: exercise.equipment || "",
        muscles: exercise.muscles || "",
        sets: exercise.sets ?? "-",
        reps: exercise.reps ?? "-",
        rest: exercise.rest ?? "-",
        instructions: exercise.instructions || ""
    };
}

function normaliseAchievements(value) {

    if (Array.isArray(value)) {
        return value.map(item => achievementItem(item, ""));
    }

    if (!isPlainObject(value)) {
        return [];
    }

    return Object.entries(value).flatMap(([group, items]) => {
        if (!Array.isArray(items)) {
            return [];
        }

        return items.map(item => achievementItem(item, group));
    });
}

function normaliseMeals(source) {
    const meals = {};
    for (const key of ["breakfast", "lunch", "dinner", "snacks"]) {
        if (source[key] !== undefined) meals[key] = source[key];
    }
    if (Array.isArray(source.meal_ideas)) meals.ideas = source.meal_ideas;
    if (isPlainObject(source.meals)) Object.assign(meals, source.meals);
    return meals;
}

function achievementItem(item, group) {

    if (typeof item === "string" || typeof item === "number") {
        return { name: String(item), description: group, requirement: "" };
    }

    if (!isPlainObject(item)) {
        return { name: "Achievement", description: group, requirement: "" };
    }

    return {
        name: firstValue(item.name, item.title, item.test, "Achievement"),
        description: firstValue(item.description, item.assessment, group, ""),
        requirement: firstValue(item.requirement, item.target, item.goal, "")
    };
}
function durationLabel(session) {
    const value = firstValue(
        session.duration,
        session.target_duration_minutes,
        session.duration_minutes,
        session.session_duration,
        "-"
    );

    return typeof value === "number" ? `${value} min` : value;
}

function restLabel(seconds) {
    return typeof seconds === "number" ? `${seconds} sec` : undefined;
}

function weeksLabel(value) {
    return typeof value === "number" ? `${value} weeks` : undefined;
}

function firstValue(...values) {
    return values.find(value => value !== undefined && value !== null && value !== "");
}

function firstArray(...values) {
    const value = values.find(Array.isArray);
    return value || [];
}

function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}
