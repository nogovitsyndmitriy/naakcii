package naakcii.by.api.subcategory.repository;

import java.util.List;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import naakcii.by.api.subcategory.repository.model.Subcategory;


public interface SubcategoryRepository extends CrudRepository<Subcategory, Long> {
	
	List<Subcategory> findByCategoryId(Long categoryId);
	List<Subcategory> findByIsActiveTrueAndCategoryId(Long categoryId);
	List<Subcategory> findByIsActiveTrueAndCategoryIdOrderByNameAsc(Long categoryId);
	List<Subcategory> findByIsActiveTrueAndCategoryIdOrderByNameDesc(Long categoryId);
	Subcategory findByNameAndCategoryName(String subcategoryName, String categoryName);
	List<Subcategory> findByIsActiveTrueAndCategoryIdOrderByPriorityAsc(Long categoryId);
	List<Subcategory> findByIsActiveTrueAndCategoryIdOrderByPriorityDesc(Long categoryId);
	@Modifying
	@Query("update Subcategory subcategory set subcategory.isActive = false where subcategory.id = :subcategoryId")
	void softDelete(@Param("subcategoryId") Long subcategoryId);
	
}
