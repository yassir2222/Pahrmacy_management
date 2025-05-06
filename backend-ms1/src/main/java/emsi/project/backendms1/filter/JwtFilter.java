package emsi.project.backendms1.filter;

import emsi.project.backendms1.configuration.JwtUtils;
import emsi.project.backendms1.service.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.logging.Logger;

public class JwtFilter extends OncePerRequestFilter {
    private final JwtUtils jwtUtils;
    private final CustomUserDetailsService customUserDetailsService;
    private static final Logger logger = Logger.getLogger(JwtFilter.class.getName());

    public JwtFilter(JwtUtils jwtUtils, CustomUserDetailsService customUserDetailsService) {
        this.jwtUtils = jwtUtils;
        this.customUserDetailsService = customUserDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        try {
            final String authHeader = request.getHeader("Authorization");
            final String requestPath = request.getServletPath();

            // Log request info for debugging
            logger.info("Processing request path: " + requestPath);
            logger.info("Authorization header: " + (authHeader != null ? "present" : "not present"));

            // Skip token validation for auth endpoints
            if (requestPath.contains("/api/auth/")) {
                logger.info("Skipping JWT validation for authentication endpoint");
                filterChain.doFilter(request, response);
                return;
            }

            String username = null;
            String jwt = null;

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                jwt = authHeader.substring(7);
                logger.info("JWT token extracted from header");
                
                // Only try to extract username if token is not empty
                if (jwt != null && !jwt.isEmpty()) {
                    username = jwtUtils.extractUsername(jwt);
                    logger.info("Username extracted from token: " + (username != null ? "success" : "failed"));
                }
            } else {
                logger.info("No valid Authorization header found");
            }

            // Only proceed with authentication if username was successfully extracted
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);
                
                if (jwtUtils.validateToken(jwt, userDetails)) {
                    logger.info("Token validated successfully for user: " + username);
                    
                    UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                    logger.info("Authentication set in SecurityContext");
                } else {
                    logger.warning("Token validation failed for user: " + username);
                }
            }
        } catch (Exception e) {
            logger.severe("Error processing JWT: " + e.getMessage());
        }
        
        filterChain.doFilter(request, response);
    }
}
