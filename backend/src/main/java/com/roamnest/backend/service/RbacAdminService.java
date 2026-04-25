package com.roamnest.backend.service;

import com.roamnest.backend.dao.ApiObjectDao;
import com.roamnest.backend.dao.RoleDao;
import com.roamnest.backend.dao.RolePrivilegeDao;
import com.roamnest.backend.dto.ApiObjectRequest;
import com.roamnest.backend.dto.RoleApiPrivilegeRequest;
import com.roamnest.backend.model.RolePrivilegeView;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
public class RbacAdminService {

    private final ApiObjectDao apiObjectDao;
    private final RoleDao roleDao;
    private final RolePrivilegeDao rolePrivilegeDao;

    public RbacAdminService(ApiObjectDao apiObjectDao,
                            RoleDao roleDao,
                            RolePrivilegeDao rolePrivilegeDao) {
        this.apiObjectDao = apiObjectDao;
        this.roleDao = roleDao;
        this.rolePrivilegeDao = rolePrivilegeDao;
    }

    @Transactional
    public Long upsertApiObject(ApiObjectRequest request) {
        return apiObjectDao.upsertApiObject(
            request.getName().trim().toUpperCase(Locale.ROOT),
            request.getPathPattern().trim(),
            request.getHttpMethod().trim().toUpperCase(Locale.ROOT),
            request.isPublic());
    }

    @Transactional
    public void grantRolePrivilege(RoleApiPrivilegeRequest request) {
        String normalizedRole = request.getRoleName().trim().toUpperCase(Locale.ROOT);
        String normalizedApiObject = request.getApiObjectName().trim().toUpperCase(Locale.ROOT);

        Long roleId = roleDao.findRoleIdByName(normalizedRole)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Role not found"));

        Long apiObjectId = apiObjectDao.findByName(normalizedApiObject)
            .map(apiObject -> apiObject.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "API object not found"));

        rolePrivilegeDao.grantPrivilege(roleId, apiObjectId);
    }

    public List<RolePrivilegeView> listPrivileges(String roleName) {
        return rolePrivilegeDao.listByRoleName(roleName.trim().toUpperCase(Locale.ROOT));
    }
}
