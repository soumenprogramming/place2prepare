package com.soumenprogramming.onlinelearning.place2prepare.seed;

import com.soumenprogramming.onlinelearning.place2prepare.course.Course;
import com.soumenprogramming.onlinelearning.place2prepare.course.CourseRepository;
import com.soumenprogramming.onlinelearning.place2prepare.course.Subject;
import com.soumenprogramming.onlinelearning.place2prepare.course.SubjectRepository;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.LiveSession;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.LiveSessionRepository;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.LiveSessionStatus;
import com.soumenprogramming.onlinelearning.place2prepare.practice.Question;
import com.soumenprogramming.onlinelearning.place2prepare.practice.QuestionOption;
import com.soumenprogramming.onlinelearning.place2prepare.practice.Quiz;
import com.soumenprogramming.onlinelearning.place2prepare.practice.QuizRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SeedDataConfig {

    @Bean
    CommandLineRunner seedData(SubjectRepository subjectRepository,
                               CourseRepository courseRepository,
                               LiveSessionRepository liveSessionRepository) {
        return args -> {
            if (subjectRepository.count() == 0) {
                Subject dsa = subjectRepository.save(new Subject(
                        "DSA",
                        "dsa",
                        "Master problem-solving patterns asked in coding rounds."
                ));
                Subject cn = subjectRepository.save(new Subject(
                        "Computer Networks",
                        "computer-networks",
                        "Understand protocols, layers, and networking interview questions."
                ));
                Subject dbms = subjectRepository.save(new Subject(
                        "DBMS",
                        "dbms",
                        "Learn normalization, indexing, transactions, and SQL depth."
                ));
                Subject springBoot = subjectRepository.save(new Subject(
                        "Spring Boot",
                        "spring-boot",
                        "Build scalable backend APIs with Spring Boot and security."
                ));

                courseRepository.saveAll(List.of(
                        new Course("DSA for Placements", "dsa-for-placements", "Comprehensive DSA roadmap for interviews.", "INTERMEDIATE", 42, true, true, dsa),
                        new Course("Computer Networks for Interviews", "cn-for-interviews", "Placement-oriented CN concepts and viva questions.", "INTERMEDIATE", 24, true, false, cn),
                        new Course("DBMS for Placements", "dbms-for-placements", "SQL + DBMS interview prep with real scenarios.", "BEGINNER", 26, true, false, dbms),
                        new Course("Core Java + Spring Boot", "core-java-spring-boot", "Backend engineering fundamentals with project practice.", "INTERMEDIATE", 35, true, true, springBoot)
                ));
            }

            if (liveSessionRepository.count() == 0) {
                Course dsaCourse = courseRepository.findBySlug("dsa-for-placements").orElse(null);
                Course springCourse = courseRepository.findBySlug("core-java-spring-boot").orElse(null);

                liveSessionRepository.saveAll(List.of(
                        new LiveSession(
                                dsaCourse,
                                "DSA Doubt Clearing: Arrays & Hashing",
                                "Bring your tough array/hashing problems and we'll solve them together on the whiteboard.",
                                "Soumen Pradhan",
                                "https://meet.example.com/dsa-doubts-arrays",
                                60,
                                Instant.now().plus(5, ChronoUnit.HOURS),
                                LiveSessionStatus.SCHEDULED
                        ),
                        new LiveSession(
                                springCourse,
                                "Spring Boot Project Review: Auth + JWT",
                                "Walk-through a production-style auth flow with JWT, refresh, and rate limiting.",
                                "Soumen Pradhan",
                                "https://meet.example.com/spring-auth-review",
                                75,
                                Instant.now().plus(1, ChronoUnit.DAYS).plus(2, ChronoUnit.HOURS),
                                LiveSessionStatus.SCHEDULED
                        ),
                        new LiveSession(
                                null,
                                "Placement Q&A: Resumes + Interview Playbook",
                                "Open to all learners. Bring a resume draft for live feedback.",
                                "Placement Team",
                                "https://meet.example.com/placement-qa",
                                45,
                                Instant.now().plus(3, ChronoUnit.DAYS),
                                LiveSessionStatus.SCHEDULED
                        )
                ));
            }
        };
    }

    @Bean
    CommandLineRunner seedQuizzes(CourseRepository courseRepository, QuizRepository quizRepository) {
        return args -> {
            if (quizRepository.count() > 0) {
                return;
            }
            courseRepository.findBySlug("dsa-for-placements").ifPresent(course -> {
                Quiz quiz = new Quiz(
                        course,
                        "DSA Warm-up: Arrays & Complexity",
                        "dsa-warmup-arrays-complexity",
                        "Sharpen your fundamentals on arrays, Big-O, and common interview traps. 5 questions, 10 minutes, pass at 60%.",
                        10,
                        60,
                        true
                );
                addQuestion(quiz,
                        "What is the worst-case time complexity of linear search on an unsorted array of n elements?",
                        "Linear search inspects every element once in the worst case, giving O(n).",
                        1,
                        List.of(
                                opt("O(1)", false),
                                opt("O(log n)", false),
                                opt("O(n)", true),
                                opt("O(n log n)", false)
                        ));
                addQuestion(quiz,
                        "Binary search requires the input array to be:",
                        "Binary search relies on dividing a sorted range in half on every step.",
                        2,
                        List.of(
                                opt("Sorted", true),
                                opt("Unsorted", false),
                                opt("Of prime length", false),
                                opt("Stored as a linked list", false)
                        ));
                addQuestion(quiz,
                        "Which of the following is NOT an in-place sorting algorithm?",
                        "Merge sort uses an auxiliary array of size O(n), so it is not in-place.",
                        3,
                        List.of(
                                opt("Bubble sort", false),
                                opt("Insertion sort", false),
                                opt("Merge sort", true),
                                opt("Quicksort (typical implementation)", false)
                        ));
                addQuestion(quiz,
                        "Two Sum on an unsorted array is best solved in O(n) time using:",
                        "A hash map lets you look up the complement of each element in O(1) average time.",
                        4,
                        List.of(
                                opt("Nested loops", false),
                                opt("Sorting + two pointers", false),
                                opt("A hash map of seen values", true),
                                opt("A priority queue", false)
                        ));
                addQuestion(quiz,
                        "What is the space complexity of reversing an array in place?",
                        "Swapping elements in place uses only a handful of variables, so O(1) extra space.",
                        5,
                        List.of(
                                opt("O(1)", true),
                                opt("O(log n)", false),
                                opt("O(n)", false),
                                opt("O(n^2)", false)
                        ));
                quizRepository.save(quiz);
            });
        };
    }

    private static void addQuestion(Quiz quiz, String prompt, String explanation, int position,
                                    List<OptionSeed> options) {
        Question question = new Question(quiz, prompt, explanation, position);
        int pos = 1;
        for (OptionSeed seed : options) {
            question.addOption(new QuestionOption(question, seed.text(), seed.correct(), pos++));
        }
        quiz.getQuestions().add(question);
    }

    private static OptionSeed opt(String text, boolean correct) {
        return new OptionSeed(text, correct);
    }

    private record OptionSeed(String text, boolean correct) {
    }
}
