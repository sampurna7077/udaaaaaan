import { simpleJsonDb } from './simple-json-storage';
import { nanoid } from 'nanoid';

export class JSONStorageAdapter {
  private mapResourceFromDb(db: any): any {
    if (!db) return db;
    return {
      ...db,
      isPublished: db.isPublished ?? db.is_published,
      isFeatured: db.isFeatured ?? db.is_featured,
      publishedAt: db.publishedAt ?? db.published_at,
      createdAt: db.createdAt ?? db.created_at,
      updatedAt: db.updatedAt ?? db.updated_at,
    };
  }

  private mapAdvertisementFromDb(db: any): any {
    if (!db) return db;
    return {
      ...db,
      isActive: db.isActive ?? db.is_active,
      priority: db.priority,
      clickCount: db.clickCount ?? db.click_count,
      impressionCount: db.impressionCount ?? db.impression_count,
      startDate: db.startDate ?? db.start_date,
      endDate: db.endDate ?? db.end_date,
      filePath: db.filePath ?? db.file_path,
      fileType: db.fileType ?? db.file_type,
      createdAt: db.createdAt ?? db.created_at,
      updatedAt: db.updatedAt ?? db.updated_at,
    };
  }

  private mapAdvertisementToDb(input: any): any {
    if (!input) return input;
    const mapped: any = { ...input };
    if (mapped.isActive !== undefined) mapped.is_active = mapped.isActive;
    if (mapped.clickCount !== undefined) mapped.click_count = mapped.clickCount;
    if (mapped.impressionCount !== undefined) mapped.impression_count = mapped.impressionCount;
    if (mapped.startDate !== undefined) mapped.start_date = mapped.startDate;
    if (mapped.endDate !== undefined) mapped.end_date = mapped.endDate;
    if (mapped.filePath !== undefined) mapped.file_path = mapped.filePath;
    if (mapped.fileType !== undefined) mapped.file_type = mapped.fileType;
    return mapped;
  }
  private mapResourceToDb(input: any): any {
    if (!input) return input;
    const mapped: any = { ...input };
    if (mapped.isPublished !== undefined) mapped.is_published = mapped.isPublished;
    if (mapped.isFeatured !== undefined) mapped.is_featured = mapped.isFeatured;
    if (mapped.publishedAt !== undefined) mapped.published_at = mapped.publishedAt;
    // Do not delete camelCase keys to avoid breaking other consumers; DB layer ignores extra keys
    return mapped;
  }
  // Method to clear cache for immediate data refresh
  clearCache(collection?: string): void {
    if (simpleJsonDb.clearCache) {
      simpleJsonDb.clearCache(collection);
    }
  }
  // User operations
  async getUser(id: string): Promise<any> {
    return await simpleJsonDb.findById('users', id);
  }

  async getUserByUsername(username: string): Promise<any> {
    const users = await simpleJsonDb.find('users', { username });
    return users[0];
  }

  async getUserByEmail(email: string): Promise<any> {
    const users = await simpleJsonDb.find('users', { email });
    return users[0];
  }

  async createUser(user: any): Promise<any> {
    return await simpleJsonDb.create('users', {
      ...user,
      id: user.id || nanoid(),
      role: user.role || 'user'
    });
  }

  async upsertUser(user: any): Promise<any> {
    const existing = await this.getUser(user.id);
    if (existing) {
      return await simpleJsonDb.update('users', user.id, user);
    } else {
      return await this.createUser(user);
    }
  }

  // Company operations
  async getCompanies(limit?: number): Promise<any[]> {
    const companies = await simpleJsonDb.find('companies');
    return limit ? companies.slice(0, limit) : companies;
  }

  async getCompany(id: string): Promise<any> {
    return await simpleJsonDb.findById('companies', id);
  }

  async createCompany(company: any): Promise<any> {
    return await simpleJsonDb.create('companies', {
      ...company,
      id: company.id || nanoid()
    });
  }

  async updateCompany(id: string, company: any): Promise<any> {
    return await simpleJsonDb.update('companies', id, company);
  }

  async deleteCompany(id: string): Promise<void> {
    await simpleJsonDb.delete('companies', id);
  }

  // Job operations
  async getJobs(filters: any = {}): Promise<{ jobs: any[]; total: number }> {
    let jobs = await simpleJsonDb.find('jobs');
    
    // Apply filters
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      jobs = jobs.filter(job => 
        job.title?.toLowerCase().includes(searchTerm) ||
        job.description?.toLowerCase().includes(searchTerm) ||
        job.location?.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.country) {
      jobs = jobs.filter(job => job.country === filters.country);
    } else if (filters.excludeCountry) {
      jobs = jobs.filter(job => job.country !== filters.excludeCountry);
    }

    if (filters.industry) {
      jobs = jobs.filter(job => job.industry === filters.industry);
    }

    if (filters.category) {
      jobs = jobs.filter(job => job.category === filters.category);
    }

    if (filters.experienceLevel) {
      jobs = jobs.filter(job => job.experienceLevel === filters.experienceLevel);
    }

    if (filters.remoteType) {
      jobs = jobs.filter(job => job.remoteType === filters.remoteType);
    }

    if (filters.visaSupport !== undefined) {
      jobs = jobs.filter(job => job.visaSupport === filters.visaSupport);
    }

    if (filters.isFeatured !== undefined) {
      jobs = jobs.filter(job => job.featured === filters.isFeatured);
    }

    if (filters.isPublished !== undefined) {
      jobs = jobs.filter(job => job.status === 'published');
    }

    // Load company data for each job
    for (const job of jobs) {
      const companyId = job.companyId || job.company_id;
      if (companyId) {
        job.company = await this.getCompany(companyId);
      }
    }

    // Apply sorting
    if (filters.sort === 'date') {
      jobs.sort((a, b) => new Date(b.posted_at || b.created_at).getTime() - new Date(a.posted_at || a.created_at).getTime());
    } else if (filters.sort === 'salary') {
      jobs.sort((a, b) => (b.salary_max || 0) - (a.salary_max || 0));
    }

    // Apply pagination
    const total = jobs.length;
    if (filters.offset || filters.limit) {
      const offset = filters.offset || 0;
      const limit = filters.limit || 20;
      jobs = jobs.slice(offset, offset + limit);
    }

    return { jobs, total };
  }

  async getJob(id: string): Promise<any> {
    const job = await simpleJsonDb.findById('jobs', id);
    if (job) {
      const companyId = job.companyId || job.company_id;
      if (companyId) {
        job.company = await this.getCompany(companyId);
      }
    }
    return job;
  }

  async getFeaturedJobs(limit?: number): Promise<any[]> {
    const jobs = await simpleJsonDb.find('jobs', { featured: true, status: 'published' });
    
    // Load company data
    for (const job of jobs) {
      const companyId = job.companyId || job.company_id;
      if (companyId) {
        job.company = await this.getCompany(companyId);
      }
    }

    return limit ? jobs.slice(0, limit) : jobs;
  }

  async createJob(job: any): Promise<any> {
    return await simpleJsonDb.create('jobs', {
      ...job,
      id: job.id || nanoid(),
      status: job.status ?? 'published',
      featured: job.featured ?? false,
      posted_at: job.posted_at || new Date().toISOString()
    });
  }

  async updateJob(id: string, job: any): Promise<any> {
    return await simpleJsonDb.update('jobs', id, job);
  }

  async deleteJob(id: string): Promise<void> {
    await simpleJsonDb.delete('jobs', id);
  }

  // Job application operations
  async getJobApplications(jobId?: string, userId?: string): Promise<any[]> {
    let query: any = {};
    if (jobId) query.job_id = jobId;
    if (userId) query.user_id = userId;

    const applications = await simpleJsonDb.find('job_applications', query);
    
    // Load related data
    for (const app of applications) {
      if (app.job_id) {
        app.job = await this.getJob(app.job_id);
      }
      if (app.user_id) {
        app.user = await this.getUser(app.user_id);
      }
    }

    return applications;
  }

  async getJobApplication(id: string): Promise<any> {
    const application = await simpleJsonDb.findById('job_applications', id);
    if (application) {
      if (application.job_id) {
        application.job = await this.getJob(application.job_id);
      }
      if (application.user_id) {
        application.user = await this.getUser(application.user_id);
      }
    }
    return application;
  }

  async createJobApplication(application: any): Promise<any> {
    return await simpleJsonDb.create('job_applications', {
      ...application,
      id: application.id || nanoid(),
      status: application.status || 'pending',
      applied_at: application.applied_at || new Date().toISOString()
    });
  }

  async updateJobApplicationStatus(id: string, status: string): Promise<any> {
    return await simpleJsonDb.update('job_applications', id, { status });
  }

  // Testimonial operations
  async getTestimonials(filters: any = {}): Promise<any[]> {
    let query: any = {};
    
    if (filters.serviceType) {
      query.service_type = filters.serviceType;
    }
    
    if (filters.isVisible !== undefined) {
      query.is_visible = filters.isVisible;
    } else {
      query.is_visible = true; // Default to visible only
    }

    let testimonials = await simpleJsonDb.find('testimonials', query);
    
    if (filters.limit) {
      testimonials = testimonials.slice(0, filters.limit);
    }

    return testimonials;
  }

  async getTestimonial(id: string): Promise<any> {
    return await simpleJsonDb.findById('testimonials', id);
  }

  async createTestimonial(testimonial: any): Promise<any> {
    return await simpleJsonDb.create('testimonials', {
      ...testimonial,
      id: testimonial.id || nanoid(),
      is_verified: testimonial.is_verified || false,
      is_visible: testimonial.is_visible !== false
    });
  }

  async updateTestimonial(id: string, testimonial: any): Promise<any> {
    return await simpleJsonDb.update('testimonials', id, testimonial);
  }

  async deleteTestimonial(id: string): Promise<void> {
    await simpleJsonDb.delete('testimonials', id);
  }

  // Form submission operations
  async getFormSubmissions(formType?: string): Promise<any[]> {
    const query = formType ? { form_type: formType } : {};
    return await simpleJsonDb.find('form_submissions', query);
  }

  async getFormSubmission(id: string): Promise<any> {
    return await simpleJsonDb.findById('form_submissions', id);
  }

  async createFormSubmission(submission: any): Promise<any> {
    return await simpleJsonDb.create('form_submissions', {
      ...submission,
      id: submission.id || nanoid(),
      status: submission.status || 'pending',
      submitted_at: submission.submitted_at || new Date().toISOString()
    });
  }

  async updateFormSubmissionStatus(id: string, status: string, notes?: string): Promise<any> {
    const updates: any = { status };
    if (notes) updates.notes = notes;
    return await simpleJsonDb.update('form_submissions', id, updates);
  }

  // Resource operations
  async getResources(filters: any = {}): Promise<any[]> {
    let query: any = {};
    
    if (filters.type) query.type = filters.type;
    if (filters.category) query.category = filters.category;
    if (filters.country) query.country = filters.country;
    if (filters.isPublished !== undefined) {
      query.is_published = filters.isPublished;
    }
    if (filters.isFeatured !== undefined) {
      query.is_featured = filters.isFeatured;
    }

    let resources = await simpleJsonDb.find('resources', query);
    
    if (filters.limit) {
      resources = resources.slice(0, filters.limit);
    }

    return resources.map((r) => this.mapResourceFromDb(r));
  }

  async getResource(id: string): Promise<any> {
    const res = await simpleJsonDb.findById('resources', id);
    return this.mapResourceFromDb(res);
  }

  async getResourceBySlug(slug: string): Promise<any> {
    const resources = await simpleJsonDb.find('resources', { slug, is_published: true });
    return this.mapResourceFromDb(resources[0]);
  }

  async createResource(resource: any): Promise<any> {
    const payload = this.mapResourceToDb(resource);
    const created = await simpleJsonDb.create('resources', {
      ...payload,
      id: payload.id || nanoid(),
      slug: payload.slug || payload.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      is_published: payload.is_published !== undefined ? payload.is_published : true,
      is_featured: payload.is_featured !== undefined ? payload.is_featured : false,
      published_at: payload.published_at || new Date().toISOString()
    });
    return this.mapResourceFromDb(created);
  }

  async updateResource(id: string, resource: any): Promise<any> {
    const updated = await simpleJsonDb.update('resources', id, this.mapResourceToDb(resource));
    return this.mapResourceFromDb(updated);
  }

  async deleteResource(id: string): Promise<void> {
    await simpleJsonDb.delete('resources', id);
  }

  // Advertisement operations
  async getAdvertisements(filters: any = {}): Promise<any[]> {
    let query: any = {};
    
    if (filters.position) query.position = filters.position;
    if (filters.isActive !== undefined) query.is_active = filters.isActive;

    let ads = await simpleJsonDb.find('advertisements', query);
    
    // Filter by date if active
    if (filters.isActive) {
      const now = new Date().toISOString();
      ads = ads.filter(ad => {
        try {
          // Handle both camelCase and snake_case date field names
          const startField = ad.start_date || ad.startDate;
          const endField = ad.end_date || ad.endDate;
          
          if (!startField || !endField) return true; // Include if no dates set
          
          const startDate = new Date(startField).toISOString();
          const endDate = new Date(endField).toISOString();
          return startDate <= now && now <= endDate;
        } catch (error) {
          console.error('Date parsing error for ad:', ad.id, error);
          return true; // Include ad if date parsing fails
        }
      });
    }

    // Sort by priority
    ads.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    if (filters.limit) {
      ads = ads.slice(0, filters.limit);
    }

    return ads.map((a) => this.mapAdvertisementFromDb(a));
  }

  async countActiveAdsByPosition(position: string): Promise<number> {
    const ads = await this.getAdvertisements({ position, isActive: true });
    return ads.length;
  }

  async getAdvertisement(id: string): Promise<any> {
    return await simpleJsonDb.findById('advertisements', id);
  }

  async createAdvertisement(ad: any): Promise<any> {
    const payload = this.mapAdvertisementToDb(ad);
    const created = await simpleJsonDb.create('advertisements', {
      ...payload,
      id: payload.id || nanoid(),
      is_active: payload.is_active !== false,
      priority: payload.priority || 0,
      click_count: payload.click_count || 0,
      impression_count: payload.impression_count || 0
    });
    return this.mapAdvertisementFromDb(created);
  }

  async updateAdvertisement(id: string, ad: any): Promise<any> {
    const updated = await simpleJsonDb.update('advertisements', id, this.mapAdvertisementToDb(ad));
    return this.mapAdvertisementFromDb(updated);
  }

  async deleteAdvertisement(id: string): Promise<void> {
    await simpleJsonDb.delete('advertisements', id);
  }

  async incrementAdClicks(id: string): Promise<void> {
    const ad = await this.getAdvertisement(id);
    if (ad) {
      await this.updateAdvertisement(id, { click_count: (ad.click_count || 0) + 1 });
    }
  }

  async incrementAdImpressions(id: string): Promise<void> {
    const ad = await this.getAdvertisement(id);
    if (ad) {
      await this.updateAdvertisement(id, { impression_count: (ad.impression_count || 0) + 1 });
    }
  }

  async deleteExpiredAdvertisements(): Promise<void> {
    const now = new Date().toISOString();
    const ads = await simpleJsonDb.find('advertisements');
    
    for (const ad of ads) {
      try {
        // Handle both camelCase and snake_case date field names
        const endField = ad.end_date || ad.endDate;
        if (!endField) continue; // Skip if no end date
        
        const endDate = new Date(endField).toISOString();
        if (endDate < now) {
          await this.deleteAdvertisement(ad.id);
        }
      } catch (error) {
        console.error('Date parsing error during cleanup for ad:', ad.id, error);
        // Skip this ad if date parsing fails
      }
    }
  }

  // Saved jobs operations  
  async saveJob(userId: string, jobId: string): Promise<any> {
    const existing = await simpleJsonDb.find('saved_jobs', { user_id: userId, job_id: jobId });
    if (existing.length > 0) {
      throw new Error('Job already saved');
    }

    return await simpleJsonDb.create('saved_jobs', {
      id: nanoid(),
      user_id: userId,
      job_id: jobId,
      saved_at: new Date().toISOString()
    });
  }

  async unsaveJob(userId: string, jobId: string): Promise<void> {
    const savedJobs = await simpleJsonDb.find('saved_jobs', { user_id: userId, job_id: jobId });
    for (const savedJob of savedJobs) {
      await simpleJsonDb.delete('saved_jobs', savedJob.id);
    }
  }

  async getSavedJobs(userId: string): Promise<any[]> {
    const savedJobs = await simpleJsonDb.find('saved_jobs', { user_id: userId });
    const jobs = [];
    
    for (const savedJob of savedJobs) {
      const job = await this.getJob(savedJob.job_id);
      if (job) {
        jobs.push({ ...job, saved_at: savedJob.saved_at });
      }
    }
    
    return jobs;
  }

  async isJobSaved(userId: string, jobId: string): Promise<boolean> {
    const savedJobs = await simpleJsonDb.find('saved_jobs', { user_id: userId, job_id: jobId });
    return savedJobs.length > 0;
  }
}