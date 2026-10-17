package com.backend.controller;

import com.backend.dto.FileDtos.FileDto;
import com.backend.dto.FileDtos.UploadResponse;
import com.backend.dto.FileDtos.VisibilityRequest;
import com.backend.service.FileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public UploadResponse upload(@AuthenticationPrincipal String userId,
                                 @RequestParam("files") List<MultipartFile> files) {
        return fileService.upload(userId, files);
    }

    @GetMapping
    public List<FileDto> list(@AuthenticationPrincipal String userId) {
        return fileService.listForUser(userId);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@AuthenticationPrincipal String userId, @PathVariable String id) {
        return DownloadResponses.attachment(fileService.downloadOwned(userId, id));
    }

    @PatchMapping("/{id}/visibility")
    public FileDto setVisibility(@AuthenticationPrincipal String userId, @PathVariable String id,
                                 @Valid @RequestBody VisibilityRequest request) {
        return fileService.setVisibility(userId, id, request.isPublic());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal String userId, @PathVariable String id) {
        fileService.delete(userId, id);
    }
}
