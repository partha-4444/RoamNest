package com.roamnest.backend.model;

public class RolePrivilegeView {
    private String roleName;
    private String apiObjectName;
    private String pathPattern;
    private String httpMethod;

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

    public String getPathPattern() {
        return pathPattern;
    }

    public void setPathPattern(String pathPattern) {
        this.pathPattern = pathPattern;
    }

    public String getHttpMethod() {
        return httpMethod;
    }

    public void setHttpMethod(String httpMethod) {
        this.httpMethod = httpMethod;
    }
}
