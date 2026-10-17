package com.backend.service;

import com.backend.config.AppProperties;
import com.backend.document.FileDocument;
import com.backend.document.UserDocument;
import com.backend.dto.FileDtos.FileDto;
import com.backend.dto.FileDtos.PublicFileDto;
import com.backend.dto.FileDtos.UploadResponse;
import com.backend.exception.ApiException;
import com.backend.repository.FileRepository;
import com.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileService {

    public record Download(FileDocument file, Resource resource) {
    }

    private final FileRepository fileRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final StorageService storageService;
    private final AppProperties props;

    public UploadResponse upload(String userId, List<MultipartFile> files) {
        List<MultipartFile> nonEmpty = files == null ? List.of()
                : files.stream().filter(f -> !f.isEmpty()).toList();
        if (nonEmpty.isEmpty()) {
            throw ApiException.badRequest("Please select at least one file");
        }

        int cost = nonEmpty.size() * props.creditsPerUpload();
        UserDocument user = userService.consumeCredits(userId, cost);

        List<FileDocument> saved = new ArrayList<>();
        try {
            for (MultipartFile file : nonEmpty) {
                String storedName = storageService.store(userId, file);
                saved.add(fileRepository.save(FileDocument.builder()
                        .ownerId(userId)
                        .name(cleanName(file.getOriginalFilename()))
                        .storedName(storedName)
                        .contentType(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                        .size(file.getSize())
                        .shared(false)
                        .uploadedAt(Instant.now())
                        .build()));
            }
        } catch (RuntimeException e) {
            // Roll back what was stored and give the credits back
            log.warn("Upload failed for user {}, rolling back", userId, e);
            saved.forEach(f -> {
                storageService.delete(f.getStoredName());
                fileRepository.delete(f);
            });
            userService.addCredits(userId, cost);
            throw e;
        }

        return new UploadResponse(saved.stream().map(FileDto::from).toList(), user.getCredits());
    }

    public List<FileDto> listForUser(String userId) {
        return fileRepository.findByOwnerIdOrderByUploadedAtDesc(userId).stream().map(FileDto::from).toList();
    }

    public FileDto setVisibility(String userId, String fileId, boolean isPublic) {
        FileDocument file = getOwned(userId, fileId);
        file.setShared(isPublic);
        return FileDto.from(fileRepository.save(file));
    }

    public void delete(String userId, String fileId) {
        FileDocument file = getOwned(userId, fileId);
        storageService.delete(file.getStoredName());
        fileRepository.delete(file);
    }

    public Download downloadOwned(String userId, String fileId) {
        FileDocument file = getOwned(userId, fileId);
        return new Download(file, storageService.load(file.getStoredName()));
    }

    public PublicFileDto getPublic(String fileId) {
        FileDocument file = getShared(fileId);
        String ownerName = userRepository.findById(file.getOwnerId())
                .map(u -> u.getFirstName() + " " + u.getLastName())
                .orElse("Unknown");
        return PublicFileDto.from(file, ownerName);
    }

    public Download downloadPublic(String fileId) {
        FileDocument file = getShared(fileId);
        return new Download(file, storageService.load(file.getStoredName()));
    }

    private FileDocument getOwned(String userId, String fileId) {
        return fileRepository.findByIdAndOwnerId(fileId, userId)
                .orElseThrow(() -> ApiException.notFound("File not found"));
    }

    /** Private files answer "not found" so their existence is not revealed. */
    private FileDocument getShared(String fileId) {
        return fileRepository.findById(fileId)
                .filter(FileDocument::isShared)
                .orElseThrow(() -> ApiException.notFound("File not found or not shared"));
    }

    private static String cleanName(String original) {
        String name = StringUtils.getFilename(StringUtils.cleanPath(original == null ? "" : original));
        return name == null || name.isBlank() ? "untitled" : name;
    }
}
