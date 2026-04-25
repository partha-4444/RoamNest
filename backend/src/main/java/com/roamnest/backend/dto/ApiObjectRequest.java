package com.roamnest.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class ApiObjectRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String pathPattern;

    @NotBlank
    private String httpMethod;

    private boolean isPublic;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    public boolean isPublic() {
        return isPublic;
    }

    public void setPublic(boolean aPublic) {
        isPublic = aPublic;
    }
}
