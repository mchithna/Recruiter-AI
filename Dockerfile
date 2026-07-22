FROM node:22-alpine AS frontend-build
WORKDIR /src/frontend

COPY frontend/package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY frontend/ ./
ARG VITE_API_BASE_URL=/api
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-build
WORKDIR /src

COPY backend/RecruitmentPlatform.API/*.csproj backend/RecruitmentPlatform.API/
COPY backend/RecruitmentPlatform.Core/*.csproj backend/RecruitmentPlatform.Core/
COPY backend/RecruitmentPlatform.Infrastructure/*.csproj backend/RecruitmentPlatform.Infrastructure/
RUN dotnet restore backend/RecruitmentPlatform.API/RecruitmentPlatform.API.csproj

COPY backend/ backend/
RUN dotnet publish backend/RecruitmentPlatform.API/RecruitmentPlatform.API.csproj \
    --configuration Release \
    --output /app/publish \
    /p:UseAppHost=false

COPY --from=frontend-build /src/frontend/dist /app/publish/wwwroot

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=backend-build /app/publish ./
ENTRYPOINT ["dotnet", "RecruitmentPlatform.API.dll"]
