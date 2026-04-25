package com.roamnest.backend.controller;

import com.roamnest.backend.dto.ApiObjectRequest;
import com.roamnest.backend.dto.RoleApiPrivilegeRequest;
import com.roamnest.backend.model.RolePrivilegeView;
import com.roamnest.backend.service.RbacAdminService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/rbac")
public class RbacAdminController {

    private final RbacAdminService rbacAdminService;

    public RbacAdminController(RbacAdminService rbacAdminService) {
        this.rbacAdminService = rbacAdminService;
    }

    @PostMapping("/api-objects")
    public ResponseEntity<Map<String, Object>> upsertApiObject(@Valid @RequestBody ApiObjectRequest request) {
        Long id = rbacAdminService.upsertApiObject(request);
        return ResponseEntity.ok(Map.of("status", "success", "apiObjectId", id));
    }

    @PostMapping("/privileges")
    public ResponseEntity<Map<String, String>> grantRolePrivilege(@Valid @RequestBody RoleApiPrivilegeRequest request) {
        rbacAdminService.grantRolePrivilege(request);
        return ResponseEntity.ok(Map.of("status", "success"));
    }

    @GetMapping("/privileges/{roleName}")
    public ResponseEntity<List<RolePrivilegeView>> listRolePrivileges(@PathVariable String roleName) {
        return ResponseEntity.ok(rbacAdminService.listPrivileges(roleName));
    }
}
