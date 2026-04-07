using System.IO;
using System.Threading.Tasks;

namespace LeaveManagement.Domain.Interfaces;

public interface IFileStorageService
{
    Task<string> SaveFileAsync(Stream fileStream, string fileName);
    Task<Stream> GetFileAsync(string storagePath);
    Task DeleteFileAsync(string storagePath);
}
