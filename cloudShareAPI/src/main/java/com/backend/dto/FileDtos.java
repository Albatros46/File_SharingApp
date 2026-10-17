package com.backend.dto;

import com.backend.document.FileDocument;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.List;

public final class FileDtos {

    private FileDtos() {
    }

    public record FileDto(String id, String name, String contentType, long size, boolean isPublic, Instant uploadedAt) {

        public static FileDto from(FileDocument file) {
            return new FileDto(file.getId(), file.getName(), file.getContentType(), file.getSize(),
                    file.isShared(), file.getUploadedAt());
        }
    }

    public record PublicFileDto(String id, String name, String contentType, long size, Instant uploadedAt,
                                String ownerName) {

        public static PublicFileDto from(FileDocument file, String ownerName) {
            return new PublicFileDto(file.getId(), file.getName(), file.getContentType(), file.getSize(),
                    file.getUploadedAt(), ownerName);
        }
    }

    public record UploadResponse(List<FileDto> files, int remainingCredits) {
    }

    public record VisibilityRequest(@NotNull Boolean isPublic) {
    }
}
