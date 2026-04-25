package com.roamnest.backend.dao;

import com.roamnest.backend.model.RolePrivilegeView;

import java.util.List;

public interface RolePrivilegeDao {
    void grantPrivilege(Long roleId, Long apiObjectId);

    boolean hasPrivilege(Long roleId, Long apiObjectId);

    List<RolePrivilegeView> listByRoleName(String roleName);
}
