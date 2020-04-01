using Microsoft.EntityFrameworkCore;
using Server.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Server.Data
{
    public class HighscoreDataContext : DbContext
    {
        public HighscoreDataContext(DbContextOptions<HighscoreDataContext> options) : base(options)
        { }

        public DbSet<Highscore> Highscores { get; set; }
    }
}
