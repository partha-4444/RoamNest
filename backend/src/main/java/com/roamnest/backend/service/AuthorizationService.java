package com.roamnest.backend.service;

import com.roamnest.backend.dao.ApiObjectDao;
import com.roamnest.backend.dao.RoleDao;
import com.roamnest.backend.dao.RolePrivilegeDao;
import com.roamnest.backend.model.ApiObjectRecord;
import org.springframework.stereotype.Service;
import org.springframework.util.AntPathMatcher;

import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class AuthorizationService {

    private final RoleDao roleDao;
    private final ApiObjectDao apiObjectDao;
    private final RolePrivilegeDao rolePrivilegeDao;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    public AuthorizationService(RoleDao roleDao,
                                ApiObjectDao apiObjectDao,
                                RolePrivilegeDao rolePrivilegeDao) {
        this.roleDao = roleDao;
        this.apiObjectDao = apiObjectDao;
        this.rolePrivilegeDao = rolePrivilegeDao;
    }

    public boolean hasApiAccess(String roleName, String requestPath, String httpMethod) {
        Optional<Long> roleIdOptional = roleDao.findRoleIdByName(roleName.toUpperCase(Locale.ROOT));
        if (roleIdOptional.isEmpty()) {
            return false;
        }

        List<ApiObjectRecord> candidates = apiObjectDao.findByMethod(httpMethod);
        Optional<ApiObjectRecord> matched = candidates.stream()
            .filter(apiObject -> pathMatcher.match(apiObject.getPathPattern(), requestPath))
            .findFirst();

        if (matched.isEmpty()) {
            return false;
        }

        return rolePrivilegeDao.hasPrivilege(roleIdOptional.get(), matched.get().getId());
    }
}
