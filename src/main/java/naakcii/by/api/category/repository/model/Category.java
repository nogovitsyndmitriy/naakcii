package naakcii.by.api.category.repository.model;

import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.validation.Valid;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import javax.validation.constraints.Size;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import naakcii.by.api.subcategory.repository.model.Subcategory;
import naakcii.by.api.util.PureSize;

@NoArgsConstructor
@Setter
@Getter
@EqualsAndHashCode(exclude = {"id", "icon", "priority", "subcategories"})
@Entity
@Table(name = "CATEGORY")
public class Category implements Serializable {
    
    private static final long serialVersionUID = -782539646608262755L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CATEGORY_ID")
    private Long id;

    @Column(name = "CATEGORY_NAME")
    @NotNull(message = "Name of the category mustn't be null.")
    @PureSize(
    	min = 3, 
    	max = 255,
    	message = "Name of the category '${validatedValue}' must be between {min} and {max} characters long."
    )
    private String name;
    
    @NotEmpty(message = "Category must have at least one subcategory.")
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL)
    private Set<
    	@Valid 
    	@NotNull(message = "Subcategory mustn't be null.") 
    	Subcategory> subcategories = new HashSet<Subcategory>();

    @Column(name = "CATEGORY_PRIORITY")
    @Positive(message = "Priority of the category '${validatedValue}' must be positive.")
    private Integer priority;

    @Column(name = "CATEGORY_ICON")
    @Size(
    	max = 255, 
    	message = "Path to the icon of the category '${validatedValue}' mustn't be more than {max} characters long."
    )
    private String icon;
    
    @Column(name = "CATEGORY_IS_ACTIVE")
    @NotNull(message = "Category must have field 'isActive' defined.")
    private Boolean isActive;
    
    public Category(String name, Boolean isActive) {
        this.name = name;
        this.isActive = isActive;
    }

    public Category(String name, Set<Subcategory> subcategories, Boolean isActive) {
        this.name = name;
        this.subcategories = subcategories;
        this.isActive = isActive;
    }
}