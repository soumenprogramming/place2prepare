package com.soumenprogramming.onlinelearning.place2prepare.admin;

import com.soumenprogramming.onlinelearning.place2prepare.admin.dto.AdminOverviewResponse;
import com.soumenprogramming.onlinelearning.place2prepare.admin.dto.AdminStudentProfileResponse;
import com.soumenprogramming.onlinelearning.place2prepare.admin.dto.AdminStudentResponse;
import com.soumenprogramming.onlinelearning.place2prepare.admin.dto.AssignCourseRequest;
import com.soumenprogramming.onlinelearning.place2prepare.admin.dto.CreateCourseRequest;
import com.soumenprogramming.onlinelearning.place2prepare.admin.dto.CreateSubjectRequest;
import com.soumenprogramming.onlinelearning.place2prepare.admin.dto.UpdateEnrollmentRequest;
import com.soumenprogramming.onlinelearning.place2prepare.course.dto.CourseResponse;
import com.soumenprogramming.onlinelearning.place2prepare.course.dto.SubjectResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/overview")
    public AdminOverviewResponse overview() {
        return adminService.getOverview();
    }

    @GetMapping("/students")
    public List<AdminStudentResponse> students() {
        return adminService.getStudents();
    }

    @GetMapping("/admins")
    public List<AdminStudentResponse> admins() {
        return adminService.getAdmins();
    }

    @GetMapping("/students/{studentId}")
    public AdminStudentProfileResponse studentProfile(@PathVariable Long studentId) {
        return adminService.getStudentProfile(studentId);
    }

    @PostMapping("/students/{studentId}/courses")
    public AdminStudentProfileResponse assignCourse(@PathVariable Long studentId,
                                                    @Valid @RequestBody AssignCourseRequest request,
                                                    Authentication authentication) {
        return adminService.assignCourseToStudent(studentId, request, authentication.getName());
    }

    /**
     * PATCH and PUT both update enrollment (same body). Use one {@link RequestMapping} so both methods
     * register — stacking {@code @PatchMapping} and {@code @PutMapping} on one method does not reliably
     * expose PUT in Spring MVC 7.
     */
    @RequestMapping(value = "/students/{studentId}/courses/{enrollmentId}", method = {
            RequestMethod.PATCH,
            RequestMethod.PUT
    })
    public AdminStudentProfileResponse updateEnrollment(@PathVariable Long studentId,
                                                        @PathVariable Long enrollmentId,
                                                        @Valid @RequestBody UpdateEnrollmentRequest request,
                                                        Authentication authentication) {
        return adminService.updateEnrollment(studentId, enrollmentId, request, authentication.getName());
    }

    @DeleteMapping("/students/{studentId}/courses/{enrollmentId}")
    public AdminStudentProfileResponse removeCourse(@PathVariable Long studentId,
                                                    @PathVariable Long enrollmentId,
                                                    Authentication authentication) {
        return adminService.removeCourseFromStudent(studentId, enrollmentId, authentication.getName());
    }

    @DeleteMapping("/students/{studentId}")
    public java.util.Map<String, String> deleteStudent(@PathVariable Long studentId, Authentication authentication) {
        adminService.deleteStudent(studentId, authentication.getName());
        return java.util.Map.of("message", "Student deleted successfully");
    }

    @GetMapping("/subjects")
    public List<SubjectResponse> subjects() {
        return adminService.getSubjects();
    }

    @PostMapping("/subjects")
    public SubjectResponse createSubject(@Valid @RequestBody CreateSubjectRequest request, Authentication authentication) {
        return adminService.createSubject(request, authentication.getName());
    }

    @GetMapping("/courses")
    public List<CourseResponse> courses() {
        return adminService.getCourses();
    }

    @PostMapping("/courses")
    public CourseResponse createCourse(@Valid @RequestBody CreateCourseRequest request, Authentication authentication) {
        return adminService.createCourse(request, authentication.getName());
    }
}
