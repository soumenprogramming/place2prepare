package com.soumenprogramming.onlinelearning.place2prepare.course;

import com.soumenprogramming.onlinelearning.place2prepare.course.dto.CourseResponse;
import com.soumenprogramming.onlinelearning.place2prepare.course.dto.LandingResponse;
import com.soumenprogramming.onlinelearning.place2prepare.course.dto.SubjectResponse;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.EnrollmentRepository;
import com.soumenprogramming.onlinelearning.place2prepare.user.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class CourseService {

    private final SubjectRepository subjectRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

    public CourseService(SubjectRepository subjectRepository,
                         CourseRepository courseRepository,
                         UserRepository userRepository,
                         EnrollmentRepository enrollmentRepository) {
        this.subjectRepository = subjectRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    public List<SubjectResponse> getSubjects() {
        return subjectRepository.findAll().stream()
                .map(subject -> new SubjectResponse(
                        subject.getId(),
                        subject.getName(),
                        subject.getSlug(),
                        subject.getDescription()
                ))
                .toList();
    }

    public List<CourseResponse> getCourses(String subject, String query, Boolean premiumOnly) {
        List<Course> courses = subject == null || subject.isBlank()
                ? courseRepository.findByActiveTrueOrderByIdAsc()
                : courseRepository.findByActiveTrueAndSubjectSlugOrderByIdAsc(subject);

        if (Boolean.TRUE.equals(premiumOnly)) {
            courses = courses.stream().filter(Course::isPremium).toList();
        }

        String needle = query == null ? "" : query.trim().toLowerCase();
        return courses.stream()
                .filter(course -> needle.isEmpty()
                        || course.getTitle().toLowerCase().contains(needle)
                        || course.getDescription().toLowerCase().contains(needle)
                        || course.getSubject().getName().toLowerCase().contains(needle))
                .map(course -> new CourseResponse(
                        course.getId(),
                        course.getTitle(),
                        course.getSlug(),
                        course.getDescription(),
                        course.getDifficulty(),
                        course.getDurationHours(),
                        course.getSubject().getName(),
                        course.isPremium()
                ))
                .toList();
    }

    public LandingResponse getLandingStats() {
        List<String> topSubjects = subjectRepository.findAll().stream()
                .limit(4)
                .map(Subject::getName)
                .toList();
        return new LandingResponse(
                userRepository.count(),
                courseRepository.count(),
                enrollmentRepository.count(),
                topSubjects
        );
    }
}
