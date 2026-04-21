package com.soumenprogramming.onlinelearning.place2prepare.admin;

import com.soumenprogramming.onlinelearning.place2prepare.admin.dto.AdminOverviewResponse;
import com.soumenprogramming.onlinelearning.place2prepare.admin.dto.AdminStudentProfileResponse;
import com.soumenprogramming.onlinelearning.place2prepare.admin.dto.AdminStudentResponse;
import com.soumenprogramming.onlinelearning.place2prepare.admin.dto.AssignCourseRequest;
import com.soumenprogramming.onlinelearning.place2prepare.admin.dto.CreateCourseRequest;
import com.soumenprogramming.onlinelearning.place2prepare.admin.dto.CreateSubjectRequest;
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
