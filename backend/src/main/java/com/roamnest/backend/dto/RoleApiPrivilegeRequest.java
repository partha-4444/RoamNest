package com.roamnest.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class RoleApiPrivilegeRequest {
    @NotBlank
    private String roleName;

    @NotBlank
    private String apiObjectName;

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }

    public String getApiObjectName() {
        return apiObjectName;
    }

    public void setApiObjectName(String apiObjectName) {
        this.apiObjectName = apiObjectName;
    }
}
