package com.foody.minitracker.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDtos {

    public record RegisterRequest(
            @NotBlank(message = "O nome é obrigatório.")
            @Size(min = 2, max = 100, message = "O nome deve ter entre 2 e 100 caracteres.")
            String name,

            @NotBlank(message = "O e-mail é obrigatório.")
            @Email(message = "Informe um e-mail válido.")
            String email,

            @NotBlank(message = "A senha é obrigatória.")
            @Size(min = 6, max = 72, message = "A senha deve ter no mínimo 6 caracteres.")
            String password
    ) {}

    public record LoginRequest(
            @NotBlank(message = "O e-mail é obrigatório.")
            @Email(message = "Informe um e-mail válido.")
            String email,

            @NotBlank(message = "A senha é obrigatória.")
            String password
    ) {}

    public record UserInfo(
            Long id,
            String name,
            String email
    ) {}

    public record AuthResponse(
            String token,
            UserInfo user
    ) {}
}
