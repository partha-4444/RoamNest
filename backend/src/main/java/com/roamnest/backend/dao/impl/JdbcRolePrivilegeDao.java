package com.roamnest.backend.dao.impl;

import com.roamnest.backend.dao.RolePrivilegeDao;
import com.roamnest.backend.model.RolePrivilegeView;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class JdbcRolePrivilegeDao implements RolePrivilegeDao {

    private static final RowMapper<RolePrivilegeView> ROLE_PRIVILEGE_ROW_MAPPER = (rs, rowNum) -> {
        RolePrivilegeView view = new RolePrivilegeView();
        view.setRoleName(rs.getString("role_name"));
        view.setApiObjectName(rs.getString("api_object_name"));
        view.setPathPattern(rs.getString("path_pattern"));
        view.setHttpMethod(rs.getString("http_method"));
        return view;
    };

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public JdbcRolePrivilegeDao(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void grantPrivilege(Long roleId, Long apiObjectId) {
        String sql = """
            insert into rn_role_api_privileges (role_id, api_object_id)
            values (:roleId, :apiObjectId)
            on conflict (role_id, api_object_id) do nothing
            """;
        jdbcTemplate.update(sql,
            new MapSqlParameterSource()
                .addValue("roleId", roleId)
                .addValue("apiObjectId", apiObjectId));
    }

    @Override
    public boolean hasPrivilege(Long roleId, Long apiObjectId) {
        String sql = """
            select count(1)
            from rn_role_api_privileges
            where role_id = :roleId and api_object_id = :apiObjectId
            """;
        Integer count = jdbcTemplate.queryForObject(sql,
            new MapSqlParameterSource()
                .addValue("roleId", roleId)
                .addValue("apiObjectId", apiObjectId),
            Integer.class);
        return count != null && count > 0;
    }

    @Override
    public List<RolePrivilegeView> listByRoleName(String roleName) {
        String sql = """
            select r.name as role_name,
                   a.name as api_object_name,
                   a.path_pattern,
                   a.http_method
            from rn_role_api_privileges p
            join rn_roles r on r.id = p.role_id
            join rn_api_objects a on a.id = p.api_object_id
            where r.name = :roleName
            order by a.http_method, a.path_pattern
            """;
        return jdbcTemplate.query(sql,
            new MapSqlParameterSource("roleName", roleName),
            ROLE_PRIVILEGE_ROW_MAPPER);
    }
}
